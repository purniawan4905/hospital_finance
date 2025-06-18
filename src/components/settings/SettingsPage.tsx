import React, { useState, useEffect } from 'react';
import { Save, Building, DollarSign, Bell, FileText, Users, Shield, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { HospitalSettings } from '../../types';
import { apiClient } from '../../utils/api';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('hospital');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<HospitalSettings>();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setInitialLoading(true);
      const response = await apiClient.getSettings();
      
      if (response.success) {
        // Reset form with loaded data
        reset(response.data);
        toast.success('Pengaturan berhasil dimuat');
      } else {
        toast.error('Gagal memuat pengaturan');
      }
    } catch (error) {
      console.error('Load settings error:', error);
      toast.error('Terjadi kesalahan saat memuat pengaturan');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: HospitalSettings) => {
    setLoading(true);
    try {
      const response = await apiClient.updateSettings(data);
      
      if (response.success) {
        toast.success('Pengaturan berhasil disimpan');
      } else {
        toast.error(response.message || 'Gagal menyimpan pengaturan');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('Terjadi kesalahan saat menyimpan pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = async () => {
    if (confirm('Apakah Anda yakin ingin mereset semua pengaturan ke default?')) {
      try {
        setLoading(true);
        const response = await apiClient.resetSettings();
        
        if (response.success) {
          reset(response.data);
          toast.success('Pengaturan berhasil direset ke default');
        } else {
          toast.error('Gagal mereset pengaturan');
        }
      } catch (error) {
        console.error('Reset settings error:', error);
        toast.error('Terjadi kesalahan saat mereset pengaturan');
      } finally {
        setLoading(false);
      }
    }
  };

  const tabs = [
    { id: 'hospital', name: 'Rumah Sakit', icon: Building },
    { id: 'tax', name: 'Pajak & Keuangan', icon: DollarSign },
    { id: 'reporting', name: 'Pelaporan', icon: FileText },
    { id: 'notifications', name: 'Notifikasi', icon: Bell },
    { id: 'security', name: 'Keamanan', icon: Shield }
  ];

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan Sistem</h1>
          <p className="text-gray-600 mt-1">Kelola konfigurasi sistem laporan keuangan</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleResetSettings}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reset ke Default
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* Hospital Info Tab */}
          {activeTab === 'hospital' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informasi Rumah Sakit</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Rumah Sakit
                  </label>
                  <input
                    type="text"
                    {...register('hospitalName', { required: 'Nama rumah sakit wajib diisi' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.hospitalName && (
                    <p className="text-red-500 text-sm mt-1">{errors.hospitalName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NPWP
                  </label>
                  <input
                    type="text"
                    {...register('taxId', { required: 'NPWP wajib diisi' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.taxId && (
                    <p className="text-red-500 text-sm mt-1">{errors.taxId.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat
                  </label>
                  <textarea
                    {...register('address', { required: 'Alamat wajib diisi' })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telepon
                  </label>
                  <input
                    type="tel"
                    {...register('phone', { required: 'Telepon wajib diisi' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email wajib diisi',
                      pattern: {
                        value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                        message: 'Format email tidak valid'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Awal Tahun Fiskal
                  </label>
                  <select
                    {...register('fiscalYearStart', { required: 'Awal tahun fiskal wajib dipilih' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2024, i, 1).toLocaleDateString('id-ID', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                  {errors.fiscalYearStart && (
                    <p className="text-red-500 text-sm mt-1">{errors.fiscalYearStart.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mata Uang
                  </label>
                  <select
                    {...register('currency', { required: 'Mata uang wajib dipilih' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="IDR">Rupiah (IDR)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                  {errors.currency && (
                    <p className="text-red-500 text-sm mt-1">{errors.currency.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tax Settings Tab */}
          {activeTab === 'tax' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Pengaturan Pajak & Keuangan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tarif Pajak Badan (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...register('taxSettings.corporateTaxRate', { 
                      required: 'Tarif pajak badan wajib diisi',
                      min: { value: 0, message: 'Tarif tidak boleh negatif' },
                      max: { value: 1, message: 'Tarif tidak boleh lebih dari 100%' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.taxSettings?.corporateTaxRate && (
                    <p className="text-red-500 text-sm mt-1">{errors.taxSettings.corporateTaxRate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tarif PPN (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...register('taxSettings.vatRate', { 
                      required: 'Tarif PPN wajib diisi',
                      min: { value: 0, message: 'Tarif tidak boleh negatif' },
                      max: { value: 1, message: 'Tarif tidak boleh lebih dari 100%' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.taxSettings?.vatRate && (
                    <p className="text-red-500 text-sm mt-1">{errors.taxSettings.vatRate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tarif PPh Pasal 23 (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...register('taxSettings.withholdingTaxRate', { 
                      required: 'Tarif PPh Pasal 23 wajib diisi',
                      min: { value: 0, message: 'Tarif tidak boleh negatif' },
                      max: { value: 1, message: 'Tarif tidak boleh lebih dari 100%' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.taxSettings?.withholdingTaxRate && (
                    <p className="text-red-500 text-sm mt-1">{errors.taxSettings.withholdingTaxRate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Jenis Pengurangan Pajak
                </label>
                <div className="space-y-2">
                  {['Penyusutan Peralatan', 'Biaya Operasional', 'Biaya Penelitian', 'Biaya CSR', 'Biaya Pelatihan'].map((deduction, index) => (
                    <label key={deduction} className="flex items-center">
                      <input
                        type="checkbox"
                        {...register(`taxSettings.deductionTypes.${index}`)}
                        value={deduction}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{deduction}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reporting Settings Tab */}
          {activeTab === 'reporting' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Pengaturan Pelaporan</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('reportingSettings.autoApproval')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Persetujuan Otomatis untuk Laporan Bulanan
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('reportingSettings.requireDualApproval')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Memerlukan Persetujuan Ganda untuk Laporan Tahunan
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arsipkan Laporan Setelah (bulan)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    {...register('reportingSettings.archiveAfterMonths', { 
                      required: 'Periode arsip wajib diisi',
                      min: { value: 1, message: 'Minimal 1 bulan' },
                      max: { value: 120, message: 'Maksimal 120 bulan' }
                    })}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.reportingSettings?.archiveAfterMonths && (
                    <p className="text-red-500 text-sm mt-1">{errors.reportingSettings.archiveAfterMonths.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Pengaturan Notifikasi</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('notificationSettings.emailNotifications')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Aktifkan Notifikasi Email
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Pengingat Deadline (hari sebelumnya)
                  </label>
                  <div className="flex gap-4">
                    {[1, 3, 7, 14, 30].map((day, index) => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          {...register(`notificationSettings.reminderDays.${index}`)}
                          value={day}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-1 text-sm text-gray-700">{day} hari</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Notifikasi untuk Role
                  </label>
                  <div className="flex gap-4">
                    {['admin', 'finance', 'viewer'].map((role, index) => (
                      <label key={role} className="flex items-center">
                        <input
                          type="checkbox"
                          {...register(`notificationSettings.notifyRoles.${index}`)}
                          value={role}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-1 text-sm text-gray-700 capitalize">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Pengaturan Keamanan</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Panjang Password
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="20"
                    {...register('securitySettings.passwordMinLength', { 
                      required: 'Panjang password minimal wajib diisi',
                      min: { value: 6, message: 'Minimal 6 karakter' },
                      max: { value: 20, message: 'Maksimal 20 karakter' }
                    })}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.securitySettings?.passwordMinLength && (
                    <p className="text-red-500 text-sm mt-1">{errors.securitySettings.passwordMinLength.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('securitySettings.requireUppercase')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Wajib Menggunakan Huruf Besar dan Kecil
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('securitySettings.requireNumbers')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Wajib Menggunakan Angka
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('securitySettings.requireSpecialChars')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Wajib Menggunakan Karakter Khusus
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sesi Timeout (menit)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    {...register('securitySettings.sessionTimeoutMinutes', { 
                      required: 'Timeout sesi wajib diisi',
                      min: { value: 5, message: 'Minimal 5 menit' },
                      max: { value: 480, message: 'Maksimal 8 jam' }
                    })}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.securitySettings?.sessionTimeoutMinutes && (
                    <p className="text-red-500 text-sm mt-1">{errors.securitySettings.sessionTimeoutMinutes.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maksimal Percobaan Login
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    {...register('securitySettings.maxLoginAttempts', { 
                      required: 'Maksimal percobaan login wajib diisi',
                      min: { value: 3, message: 'Minimal 3 percobaan' },
                      max: { value: 10, message: 'Maksimal 10 percobaan' }
                    })}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.securitySettings?.maxLoginAttempts && (
                    <p className="text-red-500 text-sm mt-1">{errors.securitySettings.maxLoginAttempts.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;