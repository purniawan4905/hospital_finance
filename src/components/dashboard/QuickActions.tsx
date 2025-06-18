import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Archive, Plus, Clock, CheckCircle, Users, TrendingUp, AlertCircle, User as UserIcon } from 'lucide-react';
import { ReviewSchedule } from '../../types';
import { apiClient } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface QuickActionsProps {
  onCreateReport: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onCreateReport }) => {
  const { user } = useAuth();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [schedules, setSchedules] = useState<ReviewSchedule[]>([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [archiveData, setArchiveData] = useState({
    monthsOld: 24,
    archiveReason: ''
  });
  const [analysisData, setAnalysisData] = useState({
    analysisType: 'performance',
    months: 12
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [schedulesRes, reportsRes, usersRes] = await Promise.all([
        apiClient.getReviewSchedules({ limit: 10 }),
        apiClient.getReports({ limit: 50, status: 'approved' }),
        apiClient.getUsers({ limit: 20 })
      ]);

      if (schedulesRes.success) setSchedules(schedulesRes.data);
      if (reportsRes.success) setReports(reportsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
    } catch (error) {
      console.error('Load data error:', error);
    }
  };

  const handleScheduleReview = () => {
    setShowScheduleModal(true);
    toast.success('Membuka form jadwal review');
  };

  const handleArchiveReports = () => {
    setShowArchiveModal(true);
    toast.success('Membuka dialog arsip laporan');
  };

  const handleAnalytics = () => {
    setShowAnalyticsModal(true);
    toast.success('Membuka analisis keuangan');
  };

  const createSchedule = async (data: any) => {
    try {
      setLoading(true);
      const response = await apiClient.createReviewSchedule({
        reportId: data.reportId,
        scheduledDate: data.date,
        reviewType: data.type,
        assignedTo: data.assignee,
        notes: data.notes,
        priority: data.priority || 'medium'
      });

      if (response.success) {
        setSchedules(prev => [response.data, ...prev]);
        setShowScheduleModal(false);
        toast.success(`Jadwal review ${data.type} berhasil dibuat untuk tanggal ${new Date(data.date).toLocaleDateString('id-ID')}`);
        loadData(); // Refresh data
      } else {
        toast.error(response.message || 'Gagal membuat jadwal review');
      }
    } catch (error) {
      console.error('Create schedule error:', error);
      toast.error('Terjadi kesalahan saat membuat jadwal review');
    } finally {
      setLoading(false);
    }
  };

  const archiveOldReports = async () => {
    try {
      setLoading(true);
      const response = await apiClient.archiveOldReports(archiveData);

      if (response.success) {
        toast.success(`${response.data.totalArchived} laporan berhasil diarsipkan`, {
          duration: 4000,
          icon: '📁',
        });
        setShowArchiveModal(false);
        loadData(); // Refresh data
      } else {
        toast.error(response.message || 'Gagal mengarsipkan laporan');
      }
    } catch (error) {
      console.error('Archive reports error:', error);
      toast.error('Terjadi kesalahan saat mengarsipkan laporan');
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async () => {
    try {
      setLoading(true);
      const response = await apiClient.generateFinancialAnalysis(analysisData);

      if (response.success) {
        toast.success('Analisis keuangan berhasil dibuat', {
          duration: 4000,
          icon: '📊',
        });
        setShowAnalyticsModal(false);
      } else {
        toast.error(response.message || 'Gagal membuat analisis keuangan');
      }
    } catch (error) {
      console.error('Generate analysis error:', error);
      toast.error('Terjadi kesalahan saat membuat analisis keuangan');
    } finally {
      setLoading(false);
    }
  };

  const updateScheduleStatus = async (scheduleId: string, newStatus: 'pending' | 'in-progress' | 'completed' | 'overdue') => {
    try {
      const response = await apiClient.updateScheduleStatus(scheduleId, newStatus);
      
      if (response.success) {
        setSchedules(prev => prev.map(schedule => 
          schedule._id === scheduleId 
            ? { ...schedule, status: newStatus, updatedAt: new Date() }
            : schedule
        ));
        
        const statusText = {
          'pending': 'menunggu',
          'in-progress': 'sedang berlangsung',
          'completed': 'selesai',
          'overdue': 'terlambat'
        };
        
        toast.success(`Status review diubah menjadi ${statusText[newStatus]}`);
      } else {
        toast.error(response.message || 'Gagal mengubah status review');
      }
    } catch (error) {
      console.error('Update schedule status error:', error);
      toast.error('Terjadi kesalahan saat mengubah status review');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case 'in-progress':
        return <Calendar className="h-3 w-3 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      default:
        return <AlertCircle className="h-3 w-3 text-red-600" />;
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Aksi Cepat</h3>
          {user && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
              <UserIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800 font-medium">{user.name}</span>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full capitalize">
                {user.role}
              </span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => {
              onCreateReport();
              toast.success('Membuka form laporan baru');
            }}
            className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <FileText className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
            <span className="text-gray-600 group-hover:text-blue-600">Buat Laporan Baru</span>
          </button>
          
          <button
            onClick={handleScheduleReview}
            className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
          >
            <Calendar className="h-5 w-5 text-gray-400 group-hover:text-green-500" />
            <span className="text-gray-600 group-hover:text-green-600">Jadwal Review</span>
          </button>
          
          <button
            onClick={handleArchiveReports}
            className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
          >
            <Archive className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
            <span className="text-gray-600 group-hover:text-purple-600">Arsip Laporan</span>
          </button>

          <button
            onClick={handleAnalytics}
            className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group"
          >
            <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-orange-500" />
            <span className="text-gray-600 group-hover:text-orange-600">Analisis Keuangan</span>
          </button>
        </div>

        {/* Recent Schedules */}
        {schedules.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-medium text-gray-900">Jadwal Review</h4>
              <span className="text-sm text-gray-500">{schedules.length} jadwal</span>
            </div>
            <div className="space-y-2">
              {schedules.slice(0, 4).map((schedule) => (
                <div key={schedule._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded-full ${
                      schedule.status === 'pending' ? 'bg-yellow-100' :
                      schedule.status === 'in-progress' ? 'bg-blue-100' :
                      schedule.status === 'completed' ? 'bg-green-100' :
                      'bg-red-100'
                    }`}>
                      {getStatusIcon(schedule.status)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Review {schedule.reviewType === 'monthly' ? 'Bulanan' : 
                               schedule.reviewType === 'quarterly' ? 'Kuartalan' : 
                               schedule.reviewType === 'annual' ? 'Tahunan' : 'Audit'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(schedule.scheduledDate).toLocaleDateString('id-ID')} • {schedule.assignedTo?.name || 'Tidak diketahui'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      schedule.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      schedule.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {schedule.status === 'pending' ? 'Menunggu' :
                       schedule.status === 'in-progress' ? 'Berlangsung' : 
                       schedule.status === 'completed' ? 'Selesai' : 'Terlambat'}
                    </span>
                    {schedule.status === 'pending' && (
                      <button
                        onClick={() => updateScheduleStatus(schedule._id, 'in-progress')}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mulai
                      </button>
                    )}
                    {schedule.status === 'in-progress' && (
                      <button
                        onClick={() => updateScheduleStatus(schedule._id, 'completed')}
                        className="text-xs text-green-600 hover:text-green-800"
                      >
                        Selesai
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {schedules.length > 4 && (
              <div className="mt-3 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Lihat semua jadwal ({schedules.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Schedule Review Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Jadwal Review Baru</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createSchedule({
                reportId: formData.get('reportId'),
                date: formData.get('date'),
                type: formData.get('type'),
                assignee: formData.get('assignee'),
                notes: formData.get('notes'),
                priority: formData.get('priority')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Laporan
                  </label>
                  <select
                    name="reportId"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih laporan</option>
                    {reports.map((report: any) => (
                      <option key={report._id} value={report._id}>
                        {report.period} - {report.reportType}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Review
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Review
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih tipe review</option>
                    <option value="monthly">Bulanan</option>
                    <option value="quarterly">Kuartalan</option>
                    <option value="annual">Tahunan</option>
                    <option value="audit">Audit</option>
                    <option value="special">Khusus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ditugaskan Kepada
                  </label>
                  <select
                    name="assignee"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih penanggung jawab</option>
                    {users.map((user: any) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioritas
                  </label>
                  <select
                    name="priority"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                    <option value="urgent">Mendesak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Catatan tambahan untuk review..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Membuat...' : 'Buat Jadwal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleModal(false);
                    toast.success('Form jadwal review ditutup');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Arsip Laporan Lama</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arsipkan laporan lebih lama dari (bulan)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={archiveData.monthsOld}
                  onChange={(e) => setArchiveData(prev => ({ ...prev, monthsOld: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alasan Arsip (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={archiveData.archiveReason}
                  onChange={(e) => setArchiveData(prev => ({ ...prev, archiveReason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Alasan mengarsipkan laporan..."
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Archive className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Perhatian:</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Laporan yang diarsipkan akan dipindahkan ke status arsip dan tidak akan muncul dalam pencarian reguler.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={archiveOldReports}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Mengarsipkan...' : 'Arsipkan Sekarang'}
              </button>
              <button
                onClick={() => {
                  setShowArchiveModal(false);
                  toast.success('Dialog arsip ditutup');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Buat Analisis Keuangan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe Analisis
                </label>
                <select
                  value={analysisData.analysisType}
                  onChange={(e) => setAnalysisData(prev => ({ ...prev, analysisType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="performance">Analisis Kinerja</option>
                  <option value="trend">Analisis Tren</option>
                  <option value="ratio">Analisis Rasio</option>
                  <option value="comparative">Analisis Komparatif</option>
                  <option value="forecast">Analisis Proyeksi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Periode Analisis (bulan)
                </label>
                <input
                  type="number"
                  min="3"
                  max="60"
                  value={analysisData.months}
                  onChange={(e) => setAnalysisData(prev => ({ ...prev, months: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Analisis akan mencakup:</h4>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• Tren pendapatan dan pengeluaran</li>
                      <li>• Rasio keuangan utama</li>
                      <li>• Proyeksi kinerja masa depan</li>
                      <li>• Rekomendasi strategis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={generateAnalysis}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Membuat...' : 'Buat Analisis'}
              </button>
              <button
                onClick={() => {
                  setShowAnalyticsModal(false);
                  toast.success('Dialog analisis ditutup');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;