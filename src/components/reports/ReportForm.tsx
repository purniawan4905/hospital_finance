import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, X } from 'lucide-react';
import { FinancialReport } from '../../types';
import toast from 'react-hot-toast';

interface ReportFormProps {
  report?: FinancialReport;
  onSave: (report: Partial<FinancialReport>) => void;
  onCancel: () => void;
}

interface FormData {
  reportType: 'monthly' | 'quarterly' | 'annual';
  year: number;
  month?: number;
  quarter?: number;
  revenue: {
    patientCare: number;
    emergencyServices: number;
    surgery: number;
    laboratory: number;
    pharmacy: number;
    other: number;
  };
  expenses: {
    salaries: number;
    medicalSupplies: number;
    equipment: number;
    utilities: number;
    maintenance: number;
    insurance: number;
    other: number;
  };
  assets: {
    current: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      other: number;
    };
    fixed: {
      buildings: number;
      equipment: number;
      vehicles: number;
      other: number;
    };
  };
  liabilities: {
    current: {
      accountsPayable: number;
      shortTermDebt: number;
      accruedExpenses: number;
      other: number;
    };
    longTerm: {
      longTermDebt: number;
      other: number;
    };
  };
  tax: {
    rate: number;
  };
}

const ReportForm: React.FC<ReportFormProps> = ({ report, onSave, onCancel }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: report || {
      reportType: 'monthly',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      revenue: {
        patientCare: 0,
        emergencyServices: 0,
        surgery: 0,
        laboratory: 0,
        pharmacy: 0,
        other: 0
      },
      expenses: {
        salaries: 0,
        medicalSupplies: 0,
        equipment: 0,
        utilities: 0,
        maintenance: 0,
        insurance: 0,
        other: 0
      },
      assets: {
        current: {
          cash: 0,
          accountsReceivable: 0,
          inventory: 0,
          other: 0
        },
        fixed: {
          buildings: 0,
          equipment: 0,
          vehicles: 0,
          other: 0
        }
      },
      liabilities: {
        current: {
          accountsPayable: 0,
          shortTermDebt: 0,
          accruedExpenses: 0,
          other: 0
        },
        longTerm: {
          longTermDebt: 0,
          other: 0
        }
      },
      tax: {
        rate: 0.25
      }
    }
  });

  const [loading, setLoading] = useState(false);
  const watchedValues = watch();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    try {
      // Calculate totals
      const totalRevenue = Object.values(data.revenue).reduce((a, b) => a + b, 0);
      const totalExpenses = Object.values(data.expenses).reduce((a, b) => a + b, 0);
      const income = totalRevenue - totalExpenses;
      const taxAmount = income * data.tax.rate;

      // Generate period string
      let period = '';
      if (data.reportType === 'monthly') {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        period = `${months[data.month! - 1]} ${data.year}`;
      } else if (data.reportType === 'quarterly') {
        period = `Q${data.quarter} ${data.year}`;
      } else {
        period = `${data.year}`;
      }

      const reportData: Partial<FinancialReport> = {
        ...data,
        period,
        tax: {
          income,
          rate: data.tax.rate,
          amount: taxAmount
        },
        hospitalId: 'hospital-1', // In real app, get from context
        updatedAt: new Date()
      };

      if (!report) {
        reportData.createdAt = new Date();
        reportData.createdBy = '1'; // In real app, get from context
      }

      onSave(reportData);
      toast.success(report ? 'Laporan berhasil diperbarui' : 'Laporan berhasil dibuat');
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan laporan');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Calculate summary values
  const totalRevenue = Object.values(watchedValues.revenue || {}).reduce((a, b) => (a || 0) + (b || 0), 0);
  const totalExpenses = Object.values(watchedValues.expenses || {}).reduce((a, b) => (a || 0) + (b || 0), 0);
  const netIncome = totalRevenue - totalExpenses;
  const taxAmount = netIncome * (watchedValues.tax?.rate || 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {report ? 'Edit Laporan' : 'Buat Laporan Baru'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
        {/* Report Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Laporan
            </label>
            <select
              {...register('reportType', { required: 'Tipe laporan wajib diisi' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="monthly">Bulanan</option>
              <option value="quarterly">Kuartalan</option>
              <option value="annual">Tahunan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahun
            </label>
            <input
              type="number"
              {...register('year', { required: 'Tahun wajib diisi', min: 2020, max: 2030 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {watchedValues.reportType === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bulan
              </label>
              <select
                {...register('month', { required: 'Bulan wajib diisi' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i, 1).toLocaleDateString('id-ID', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          )}

          {watchedValues.reportType === 'quarterly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kuartal
              </label>
              <select
                {...register('quarter', { required: 'Kuartal wajib diisi' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>Q1</option>
                <option value={2}>Q2</option>
                <option value={3}>Q3</option>
                <option value={4}>Q4</option>
              </select>
            </div>
          )}
        </div>

        {/* Revenue Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pendapatan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Perawatan Pasien
              </label>
              <input
                type="number"
                {...register('revenue.patientCare', { min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Layanan Darurat
              </label>
              <input
                type="number"
                {...register('revenue.emergencyServices', { min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operasi
              </label>
              <input
                type="number"
                {...register('revenue.surgery', { min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Laboratorium
              </label>
              <input
                type="number"
                {...register('revenue.laboratory', { min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farmasi
              </label>
              <input
                type="number"
                {...register('revenue.pharmacy', { min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lainnya
              </label>
              <input
                type="number"
                {...register('revenue.other', { min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengeluaran</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gaji dan Tunjangan
              </label>
              <input
                type="number"
                {...register('expenses.salaries', { min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Persediaan Medis
              </label>
              <input
                type="number"
                {...register('expenses.medicalSupplies', { min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peralatan
              </label>
              <input
                type="number"
                {...register('expenses.equipment', { min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Utilitas
              </label>
              <input
                type="number"
                {...register('expenses.utilities', { min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pemeliharaan
              </label>
              <input
                type="number"
                {...register('expenses.maintenance', { min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asuransi
              </label>
              <input
                type="number"
                {...register('expenses.insurance', { min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Assets Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aset</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Aset Lancar</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kas</label>
                  <input
                    type="number"
                    {...register('assets.current.cash', { min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Piutang</label>
                  <input
                    type="number"
                    {...register('assets.current.accountsReceivable', { min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Persediaan</label>
                  <input
                    type="number"
                    {...register('assets.current.inventory', { min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Aset Tetap</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bangunan</label>
                  <input
                    type="number"
                    {...register('assets.fixed.buildings', { min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peralatan</label>
                  <input
                    type="number"
                    {...register('assets.fixed.equipment', { min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kendaraan</label>
                  <input
                    type="number"
                    {...register('assets.fixed.vehicles', { min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Liabilities Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kewajiban</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Kewajiban Lancar</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hutang Usaha</label>
                  <input
                    type="number"
                    {...register('liabilities.current.accountsPayable', { min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hutang Jangka Pendek</label>
                  <input
                    type="number"
                    {...register('liabilities.current.shortTermDebt', { min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beban yang Masih Harus Dibayar</label>
                  <input
                    type="number"
                    {...register('liabilities.current.accruedExpenses', { min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Kewajiban Jangka Panjang</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hutang Jangka Panjang</label>
                  <input
                    type="number"
                    {...register('liabilities.longTerm.longTermDebt', { min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pajak</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tarif Pajak (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                {...register('tax.rate', { min: 0, max: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Pendapatan</p>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Pengeluaran</p>
              <p className="text-lg font-semibold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Laba Sebelum Pajak</p>
              <p className={`text-lg font-semibold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netIncome)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Beban Pajak</p>
              <p className="text-lg font-semibold text-blue-600">{formatCurrency(taxAmount)}</p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Menyimpan...' : 'Simpan Laporan'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;