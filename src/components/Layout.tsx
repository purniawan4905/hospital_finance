import React, { ReactNode, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Guitar as Hospital, BarChart3, FileText, Settings, User, AlertTriangle, Bell, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Laporan', href: '/reports', icon: FileText },
    { name: 'Pengaturan', href: '/settings', icon: Settings },
  ];

  // Mock notifications - in real app, fetch from API
  const notifications = [
    {
      id: 1,
      type: 'warning',
      title: 'Laporan Menunggu Persetujuan',
      message: 'Ada 3 laporan yang menunggu persetujuan Anda',
      time: '5 menit yang lalu',
      unread: true
    },
    {
      id: 2,
      type: 'success',
      title: 'Laporan Disetujui',
      message: 'Laporan Februari 2024 telah disetujui',
      time: '1 jam yang lalu',
      unread: true
    },
    {
      id: 3,
      type: 'info',
      title: 'Jadwal Review',
      message: 'Review laporan kuartalan dijadwalkan besok',
      time: '2 jam yang lalu',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'info':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'finance':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'finance':
        return 'Finance';
      case 'viewer':
        return 'Viewer';
      default:
        return role;
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    toast.success('Anda telah berhasil keluar dari sistem', {
      duration: 3000,
      icon: '👋',
    });
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
    toast.success('Logout dibatalkan');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <img
            src="https://pendaftaran.rsusebeningkasih.com/assets/images/logo-laporan.png"   
            alt="Logo RS Sebening Kasih"
            className="h-8 w-8"
            draggable={false}
          />
          <span className="ml-2 text-xl font-bold text-gray-900">
            RS Sebening Kasih
          </span>
        </div>
        
        <nav className="mt-8">
          <div className="space-y-1 px-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => toast.success(`Membuka halaman ${item.name}`)}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info and actions */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200">
          {/* User Access Notification */}
          {user && (
            <div className="p-4 border-b border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Akses Pengguna</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-700">Role:</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-700">Hospital ID:</span>
                    <span className="text-xs text-blue-800 font-mono">{user.hospitalId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-700">Status:</span>
                    <span className="text-xs text-green-700 font-medium">Aktif</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center gap-2 w-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Bell className="h-4 w-4" />
                <span className="text-sm">Notifikasi</span>
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900">Notifikasi</h4>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-3 hover:bg-gray-50 ${notification.unread ? 'bg-blue-50' : ''}`}>
                        <div className="flex items-start gap-2">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-gray-200">
                    <button className="text-xs text-blue-600 hover:text-blue-800 w-full text-center">
                      Lihat semua notifikasi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{getRoleLabel(user?.role || '')}</p>
              </div>
              <button
                onClick={handleLogoutClick}
                className="ml-3 p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                title="Keluar dari sistem"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Logout</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin keluar dari sistem? Semua data yang belum disimpan akan hilang.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Pastikan:</strong> Semua laporan telah disimpan dan tidak ada proses yang sedang berjalan.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Ya, Keluar
              </button>
              <button
                onClick={cancelLogout}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default Layout;