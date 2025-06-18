import React from 'react';
import { FinancialReport } from '../../types';
import { TrendingUp, TrendingDown, DollarSign, Building, CreditCard, FileText, Calendar, User } from 'lucide-react';

interface ReportDetailViewProps {
  report: FinancialReport;
}

const ReportDetailView: React.FC<ReportDetailViewProps> = ({ report }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalRevenue = Object.values(report.revenue).reduce((a, b) => a + b, 0);
  const totalExpenses = Object.values(report.expenses).reduce((a, b) => a + b, 0);
  const grossProfit = totalRevenue - totalExpenses;
  const netProfit = grossProfit - report.tax.amount;

  const totalCurrentAssets = Object.values(report.assets.current).reduce((a, b) => a + b, 0);
  const totalFixedAssets = Object.values(report.assets.fixed).reduce((a, b) => a + b, 0);
  const totalAssets = totalCurrentAssets + totalFixedAssets;

  const totalCurrentLiabilities = Object.values(report.liabilities.current).reduce((a, b) => a + b, 0);
  const totalLongTermLiabilities = Object.values(report.liabilities.longTerm).reduce((a, b) => a + b, 0);
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  const totalEquity = report.equity.capital + report.equity.retainedEarnings + report.equity.currentEarnings;

  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const currentRatio = totalCurrentLiabilities > 0 ? totalCurrentAssets / totalCurrentLiabilities : 0;
  const debtToEquityRatio = totalEquity > 0 ? totalLiabilities / totalEquity : 0;

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Detail Laporan Keuangan</h2>
            <p className="text-lg text-gray-600 mt-1">{report.period}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Dibuat: {formatDate(report.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Pembuat: Administrator</span>
              </div>
              {report.approvedAt && (
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>Disetujui: {formatDate(report.approvedAt)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              report.status === 'draft' ? 'bg-gray-100 text-gray-800' :
              report.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
              report.status === 'approved' ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {report.status === 'draft' ? 'Draft' :
               report.status === 'submitted' ? 'Diajukan' :
               report.status === 'approved' ? 'Disetujui' : 'Diarsipkan'}
            </span>
            <p className="text-sm text-gray-500 mt-2">
              Tipe: {report.reportType === 'monthly' ? 'Bulanan' :
                     report.reportType === 'quarterly' ? 'Kuartalan' : 'Tahunan'}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Laba Bersih</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Margin Keuntungan</p>
              <p className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitMargin.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue and Expenses Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rincian Pendapatan</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Perawatan Pasien</span>
              <span className="font-semibold text-green-600">{formatCurrency(report.revenue.patientCare)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Layanan Darurat</span>
              <span className="font-semibold text-green-600">{formatCurrency(report.revenue.emergencyServices)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Operasi</span>
              <span className="font-semibold text-green-600">{formatCurrency(report.revenue.surgery)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Laboratorium</span>
              <span className="font-semibold text-green-600">{formatCurrency(report.revenue.laboratory)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Farmasi</span>
              <span className="font-semibold text-green-600">{formatCurrency(report.revenue.pharmacy)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Lainnya</span>
              <span className="font-semibold text-green-600">{formatCurrency(report.revenue.other)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border-t-2 border-green-200">
              <span className="font-bold text-gray-900">Total Pendapatan</span>
              <span className="font-bold text-green-600">{formatCurrency(totalRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Expenses Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rincian Pengeluaran</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">Gaji dan Tunjangan</span>
              <span className="font-semibold text-red-600">{formatCurrency(report.expenses.salaries)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">Persediaan Medis</span>
              <span className="font-semibold text-red-600">{formatCurrency(report.expenses.medicalSupplies)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">Peralatan</span>
              <span className="font-semibold text-red-600">{formatCurrency(report.expenses.equipment)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">Utilitas</span>
              <span className="font-semibold text-red-600">{formatCurrency(report.expenses.utilities)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">Pemeliharaan</span>
              <span className="font-semibold text-red-600">{formatCurrency(report.expenses.maintenance)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">Asuransi</span>
              <span className="font-semibold text-red-600">{formatCurrency(report.expenses.insurance)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">Lainnya</span>
              <span className="font-semibold text-red-600">{formatCurrency(report.expenses.other)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg border-t-2 border-red-200">
              <span className="font-bold text-gray-900">Total Pengeluaran</span>
              <span className="font-bold text-red-600">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Position Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Ringkasan Posisi Keuangan</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Assets */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Aset
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Aset Lancar</span>
                <span className="font-medium">{formatCurrency(totalCurrentAssets)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Aset Tetap</span>
                <span className="font-medium">{formatCurrency(totalFixedAssets)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                <span>Total Aset</span>
                <span className="text-blue-600">{formatCurrency(totalAssets)}</span>
              </div>
            </div>
          </div>

          {/* Liabilities */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-600" />
              Kewajiban
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Kewajiban Lancar</span>
                <span className="font-medium">{formatCurrency(totalCurrentLiabilities)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kewajiban Jangka Panjang</span>
                <span className="font-medium">{formatCurrency(totalLongTermLiabilities)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                <span>Total Kewajiban</span>
                <span className="text-red-600">{formatCurrency(totalLiabilities)}</span>
              </div>
            </div>
          </div>

          {/* Equity */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Ekuitas
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Modal Dasar</span>
                <span className="font-medium">{formatCurrency(report.equity.capital)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Laba Ditahan</span>
                <span className="font-medium">{formatCurrency(report.equity.retainedEarnings)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Laba Tahun Berjalan</span>
                <span className="font-medium">{formatCurrency(report.equity.currentEarnings)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                <span>Total Ekuitas</span>
                <span className="text-green-600">{formatCurrency(totalEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Ratios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Rasio Keuangan</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{currentRatio.toFixed(2)}</p>
            <p className="text-sm font-medium text-gray-900">Current Ratio</p>
            <p className="text-xs text-gray-600">Kemampuan membayar hutang jangka pendek</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{debtToEquityRatio.toFixed(2)}</p>
            <p className="text-sm font-medium text-gray-900">Debt to Equity Ratio</p>
            <p className="text-xs text-gray-600">Perbandingan hutang dengan ekuitas</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{profitMargin.toFixed(1)}%</p>
            <p className="text-sm font-medium text-gray-900">Profit Margin</p>
            <p className="text-xs text-gray-600">Persentase keuntungan dari pendapatan</p>
          </div>
        </div>
      </div>

      {/* Tax Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Informasi Pajak</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Penghasilan Kena Pajak</span>
              <span className="font-medium">{formatCurrency(report.tax.income)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tarif Pajak</span>
              <span className="font-medium">{(report.tax.rate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pengurangan Pajak</span>
              <span className="font-medium">{formatCurrency(report.tax.deductions)}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Penghasilan Kena Pajak Bersih</span>
              <span className="font-medium">{formatCurrency(report.tax.netTaxable)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
              <span>Total Pajak</span>
              <span className="text-red-600">{formatCurrency(report.tax.amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {report.notes && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Catatan</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{report.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ReportDetailView;