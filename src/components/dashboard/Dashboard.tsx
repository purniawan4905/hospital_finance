import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Building, CreditCard, FileText, Download, Calendar, Scale } from 'lucide-react';
import StatsCard from './StatsCard';
import QuickActions from './QuickActions';
import { DashboardStats } from '../../types';
import { apiClient } from '../../utils/api';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [expenseChartData, setExpenseChartData] = useState([]);
  const [profitChartData, setProfitChartData] = useState([]);
  const [balanceSheetData, setBalanceSheetData] = useState([]);
  const [ratios, setRatios] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all dashboard data in parallel
      const [
        statsResponse,
        revenueResponse,
        expenseResponse,
        profitResponse,
        balanceResponse,
        ratiosResponse
      ] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getRevenueChart(selectedPeriod !== 'all' ? parseInt(selectedPeriod) : undefined),
        apiClient.getExpenseChart(selectedPeriod !== 'all' ? parseInt(selectedPeriod) : undefined),
        apiClient.getProfitChart(selectedPeriod !== 'all' ? parseInt(selectedPeriod) : undefined),
        apiClient.getBalanceSheetChart(),
        apiClient.getFinancialRatios()
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (revenueResponse.success) {
        setRevenueChartData(revenueResponse.data);
      }

      if (expenseResponse.success) {
        setExpenseChartData(expenseResponse.data);
      }

      if (profitResponse.success) {
        setProfitChartData(profitResponse.data);
      }

      if (balanceResponse.success) {
        setBalanceSheetData(balanceResponse.data);
      }

      if (ratiosResponse.success) {
        setRatios(ratiosResponse.data);
      }

    } catch (error) {
      console.error('Load dashboard data error:', error);
      toast.error('Terjadi kesalahan saat memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = () => {
    navigate('/reports');
  };

  const handleExportPDF = async () => {
    try {
      const element = document.getElementById('dashboard');
      if (element) {
        await exportToPDF({} as any, 'dashboard');
        toast.success('PDF berhasil diekspor');
      }
    } catch (error) {
      toast.error('Gagal mengekspor PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      // Get reports for export
      const response = await apiClient.getReports({ limit: 100 });
      if (response.success && response.data.length > 0) {
        exportToExcel(response.data);
        toast.success('Excel berhasil diekspor');
      } else {
        toast.error('Tidak ada data untuk diekspor');
      }
    } catch (error) {
      toast.error('Gagal mengekspor Excel');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tidak ada data untuk ditampilkan</p>
      </div>
    );
  }

  // Prepare chart data for revenue vs expenses
  const revenueExpenseData = revenueChartData.map((revenue: any, index: number) => {
    const expense = expenseChartData[index];
    return {
      name: revenue.name,
      pendapatan: revenue.value,
      pengeluaran: expense ? expense.value : 0,
    };
  });

  return (
    <div id="dashboard" className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Keuangan</h1>
          <p className="text-gray-600 mt-1">Ringkasan laporan keuangan rumah sakit</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Periode</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Pendapatan"
          value={`Rp ${(stats.totalRevenue / 1000000000).toFixed(1)}M`}
          change={`+${stats.revenueGrowth.toFixed(1)}%`}
          changeType={stats.revenueGrowth >= 0 ? 'positive' : 'negative'}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Total Pengeluaran"
          value={`Rp ${(stats.totalExpenses / 1000000000).toFixed(1)}M`}
          icon={TrendingDown}
          color="red"
        />
        <StatsCard
          title="Laba Bersih"
          value={`Rp ${(stats.netProfit / 1000000000).toFixed(1)}M`}
          change={`${stats.profitMargin.toFixed(1)}% margin`}
          changeType={stats.profitMargin >= 0 ? 'positive' : 'negative'}
          icon={DollarSign}
          color="blue"
        />
        <StatsCard
          title="Total Aset"
          value={`Rp ${(stats.totalAssets / 1000000000).toFixed(1)}M`}
          icon={Building}
          color="purple"
        />
      </div>

      {/* Additional Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Kewajiban"
          value={`Rp ${(stats.totalLiabilities / 1000000000).toFixed(1)}M`}
          icon={CreditCard}
          color="yellow"
        />
        <StatsCard
          title="Total Ekuitas"
          value={`Rp ${(stats.totalEquity / 1000000000).toFixed(1)}M`}
          icon={Scale}
          color="indigo"
        />
        <StatsCard
          title="Beban Pajak"
          value={`Rp ${(stats.taxAmount / 1000000).toFixed(0)}Jt`}
          change={`Rasio: ${((stats.taxAmount / stats.totalRevenue) * 100).toFixed(1)}%`}
          icon={FileText}
          color="red"
        />
      </div>

      {/* Financial Ratios */}
      {ratios && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rasio Keuangan</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{ratios.currentRatio.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Current Ratio</p>
              <p className="text-xs text-gray-500">Likuiditas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{ratios.debtToEquityRatio.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Debt to Equity</p>
              <p className="text-xs text-gray-500">Leverage</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{ratios.profitMargin.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Profit Margin</p>
              <p className="text-xs text-gray-500">Profitabilitas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{ratios.assetTurnover.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Asset Turnover</p>
              <p className="text-xs text-gray-500">Efisiensi</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue vs Expenses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pendapatan vs Pengeluaran</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueExpenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`Rp ${value}M`, '']} />
              <Legend />
              <Bar dataKey="pendapatan" fill="#10B981" name="Pendapatan" />
              <Bar dataKey="pengeluaran" fill="#EF4444" name="Pengeluaran" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Balance Sheet Composition */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Komposisi Neraca</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={balanceSheetData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {balanceSheetData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`Rp ${value}M`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Breakdown and Profit Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakdown Pendapatan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueChartData.length > 0 ? Object.entries(revenueChartData[0]?.breakdown || {}).map(([key, value]) => ({
                  name: key,
                  value: value
                })) : []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueChartData.length > 0 && Object.entries(revenueChartData[0]?.breakdown || {}).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`Rp ${value}M`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Profit Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tren Keuntungan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={profitChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`Rp ${value}M`, 'Keuntungan']} />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions onCreateReport={handleCreateReport} />
    </div>
  );
};

export default Dashboard;