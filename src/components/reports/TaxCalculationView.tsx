import React from 'react';
import { FinancialReport } from '../../types';
import { Calculator, FileText, DollarSign } from 'lucide-react';

interface TaxCalculationViewProps {
  report: FinancialReport;
}

const TaxCalculationView: React.FC<TaxCalculationViewProps> = ({ report }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  const totalRevenue = Object.values(report.revenue).reduce((a, b) => a + b, 0);
  const totalExpenses = Object.values(report.expenses).reduce((a, b) => a + b, 0);
  const grossProfit = totalRevenue - totalExpenses;

  // Tax calculations
  const taxableIncome = Math.max(0, grossProfit - report.tax.deductions);
  const corporateTax = taxableIncome * report.tax.rate;
  const netIncomeAfterTax = taxableIncome - corporateTax;

  // Additional tax details
  const vatOnRevenue = totalRevenue * 0.11; // 11% VAT
  const withholdingTax = totalRevenue * 0.02; // 2% withholding tax
  const totalTaxBurden = corporateTax + vatOnRevenue + withholdingTax;

  return (
    <div className="space-y-6">
      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pajak Penghasilan Badan</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(corporateTax)}</p>
              <p className="text-sm text-gray-500">Tarif: {formatPercentage(report.tax.rate)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Calculator className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">PPN Keluaran</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(vatOnRevenue)}</p>
              <p className="text-sm text-gray-500">Tarif: 11%</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Beban Pajak</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalTaxBurden)}</p>
              <p className="text-sm text-gray-500">Semua jenis pajak</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Tax Calculation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Perhitungan Pajak Penghasilan Badan</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-200">
            <span className="text-gray-600">Total Pendapatan</span>
            <span className="font-medium text-right">{formatCurrency(totalRevenue)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-200">
            <span className="text-gray-600">Total Pengeluaran</span>
            <span className="font-medium text-right text-red-600">({formatCurrency(totalExpenses)})</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-200 font-semibold">
            <span className="text-gray-900">Laba Kotor</span>
            <span className="text-right text-green-600">{formatCurrency(grossProfit)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-200">
            <span className="text-gray-600">Pengurangan Pajak</span>
            <span className="font-medium text-right text-red-600">({formatCurrency(report.tax.deductions)})</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-200 font-semibold">
            <span className="text-gray-900">Penghasilan Kena Pajak</span>
            <span className="text-right text-blue-600">{formatCurrency(taxableIncome)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-200">
            <span className="text-gray-600">Tarif Pajak ({formatPercentage(report.tax.rate)})</span>
            <span className="font-medium text-right">{formatPercentage(report.tax.rate)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 py-3 border-b-2 border-gray-300 font-bold text-lg">
            <span className="text-gray-900">Pajak Penghasilan Badan</span>
            <span className="text-right text-red-600">{formatCurrency(corporateTax)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 py-3 font-semibold text-lg">
            <span className="text-gray-900">Laba Bersih Setelah Pajak</span>
            <span className="text-right text-green-600">{formatCurrency(netIncomeAfterTax)}</span>
          </div>
        </div>
      </div>

      {/* Other Tax Obligations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Kewajiban Pajak Lainnya</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Pajak Pertambahan Nilai (PPN)</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">PPN Keluaran (11%)</span>
                <span className="font-medium">{formatCurrency(vatOnRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PPN Masukan (estimasi)</span>
                <span className="font-medium">{formatCurrency(totalExpenses * 0.11)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                <span>PPN yang Harus Dibayar</span>
                <span className="text-orange-600">{formatCurrency(Math.max(0, vatOnRevenue - (totalExpenses * 0.11)))}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Pajak Penghasilan Pasal 23</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">PPh Pasal 23 (2%)</span>
                <span className="font-medium">{formatCurrency(withholdingTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Basis Pengenaan</span>
                <span className="font-medium">{formatCurrency(totalRevenue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Planning Recommendations */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Rekomendasi Perencanaan Pajak</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Optimalisasi Pengurangan</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Maksimalkan biaya penyusutan peralatan medis</li>
              <li>• Manfaatkan biaya CSR hingga 1% dari laba kotor</li>
              <li>• Optimalkan biaya pelatihan karyawan</li>
              <li>• Pertimbangkan investasi R&D untuk pengurangan pajak</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Strategi Pembayaran</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Cicil pajak bulanan untuk menghindari denda</li>
              <li>• Manfaatkan fasilitas sunset policy jika tersedia</li>
              <li>• Pertimbangkan restitusi PPN jika memungkinkan</li>
              <li>• Siapkan dana pajak dalam rekening terpisah</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculationView;