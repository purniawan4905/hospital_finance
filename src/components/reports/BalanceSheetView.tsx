import React from 'react';
import { FinancialReport } from '../../types';

interface BalanceSheetViewProps {
  report: FinancialReport;
}

const BalanceSheetView: React.FC<BalanceSheetViewProps> = ({ report }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalCurrentAssets = Object.values(report.assets.current).reduce((a, b) => a + b, 0);
  const totalFixedAssets = Object.values(report.assets.fixed).reduce((a, b) => a + b, 0);
  const totalAssets = totalCurrentAssets + totalFixedAssets;

  const totalCurrentLiabilities = Object.values(report.liabilities.current).reduce((a, b) => a + b, 0);
  const totalLongTermLiabilities = Object.values(report.liabilities.longTerm).reduce((a, b) => a + b, 0);
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  const totalEquity = report.equity.capital + report.equity.retainedEarnings + report.equity.currentEarnings;

  const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Neraca</h2>
          <p className="text-gray-600">Periode: {report.period}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isBalanced ? 'Neraca Seimbang' : 'Neraca Tidak Seimbang'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assets */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            ASET
          </h3>
          
          {/* Current Assets */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Aset Lancar</h4>
            <div className="space-y-2 ml-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Kas dan Setara Kas</span>
                <span className="font-medium">{formatCurrency(report.assets.current.cash)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Piutang Usaha</span>
                <span className="font-medium">{formatCurrency(report.assets.current.accountsReceivable)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Persediaan</span>
                <span className="font-medium">{formatCurrency(report.assets.current.inventory)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Aset Lancar Lainnya</span>
                <span className="font-medium">{formatCurrency(report.assets.current.other)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                <span>Total Aset Lancar</span>
                <span>{formatCurrency(totalCurrentAssets)}</span>
              </div>
            </div>
          </div>

          {/* Fixed Assets */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Aset Tetap</h4>
            <div className="space-y-2 ml-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Bangunan</span>
                <span className="font-medium">{formatCurrency(report.assets.fixed.buildings)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Peralatan Medis</span>
                <span className="font-medium">{formatCurrency(report.assets.fixed.equipment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kendaraan</span>
                <span className="font-medium">{formatCurrency(report.assets.fixed.vehicles)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Aset Tetap Lainnya</span>
                <span className="font-medium">{formatCurrency(report.assets.fixed.other)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                <span>Total Aset Tetap</span>
                <span>{formatCurrency(totalFixedAssets)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t-2 border-gray-300 text-lg font-bold text-blue-600">
            <span>TOTAL ASET</span>
            <span>{formatCurrency(totalAssets)}</span>
          </div>
        </div>

        {/* Liabilities and Equity */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            KEWAJIBAN DAN EKUITAS
          </h3>
          
          {/* Current Liabilities */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Kewajiban Lancar</h4>
            <div className="space-y-2 ml-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Hutang Usaha</span>
                <span className="font-medium">{formatCurrency(report.liabilities.current.accountsPayable)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hutang Jangka Pendek</span>
                <span className="font-medium">{formatCurrency(report.liabilities.current.shortTermDebt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Beban yang Masih Harus Dibayar</span>
                <span className="font-medium">{formatCurrency(report.liabilities.current.accruedExpenses)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kewajiban Lancar Lainnya</span>
                <span className="font-medium">{formatCurrency(report.liabilities.current.other)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                <span>Total Kewajiban Lancar</span>
                <span>{formatCurrency(totalCurrentLiabilities)}</span>
              </div>
            </div>
          </div>

          {/* Long-term Liabilities */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Kewajiban Jangka Panjang</h4>
            <div className="space-y-2 ml-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Hutang Jangka Panjang</span>
                <span className="font-medium">{formatCurrency(report.liabilities.longTerm.longTermDebt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kewajiban Jangka Panjang Lainnya</span>
                <span className="font-medium">{formatCurrency(report.liabilities.longTerm.other)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                <span>Total Kewajiban Jangka Panjang</span>
                <span>{formatCurrency(totalLongTermLiabilities)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-red-600 mb-6">
            <span>TOTAL KEWAJIBAN</span>
            <span>{formatCurrency(totalLiabilities)}</span>
          </div>

          {/* Equity */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Ekuitas</h4>
            <div className="space-y-2 ml-4">
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
              <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-green-600">
                <span>Total Ekuitas</span>
                <span>{formatCurrency(totalEquity)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t-2 border-gray-300 text-lg font-bold text-blue-600">
            <span>TOTAL KEWAJIBAN DAN EKUITAS</span>
            <span>{formatCurrency(totalLiabilities + totalEquity)}</span>
          </div>
        </div>
      </div>

      {/* Balance Check */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Verifikasi Neraca</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Aset:</span>
            <span className="ml-2 font-medium">{formatCurrency(totalAssets)}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Kewajiban + Ekuitas:</span>
            <span className="ml-2 font-medium">{formatCurrency(totalLiabilities + totalEquity)}</span>
          </div>
          <div>
            <span className="text-gray-600">Selisih:</span>
            <span className={`ml-2 font-medium ${
              isBalanced ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(Math.abs(totalAssets - (totalLiabilities + totalEquity)))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheetView;