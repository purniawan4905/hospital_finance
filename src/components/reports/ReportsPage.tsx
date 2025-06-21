import React, { useState, useEffect } from 'react';
import { Plus, Download, Edit, Trash2, Eye, Search, Filter, BarChart3, Calculator, FileText, CheckCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { FinancialReport } from '../../types';
import { apiClient } from '../../utils/api';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import ReportForm from './ReportForm';
import BalanceSheetView from './BalanceSheetView';
import TaxCalculationView from './TaxCalculationView';
import ReportDetailView from './ReportDetailView';
import toast from 'react-hot-toast';

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<FinancialReport | null>(null);
  const [viewingReport, setViewingReport] = useState<FinancialReport | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'balance' | 'tax'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'monthly' | 'quarterly' | 'annual'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'submitted' | 'approved' | 'archived'>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'period' | 'revenue' | 'profit' | 'created'>('period');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState<FinancialReport | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadReports();
  }, [searchTerm, filterType, filterStatus, selectedYear, sortBy, sortOrder, pagination.page]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder
      };

      if (searchTerm) params.search = searchTerm;
      if (filterType !== 'all') params.reportType = filterType;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (selectedYear !== 'all') params.year = selectedYear;

      const response = await apiClient.getReports(params);
      
      if (response.success) {
        setReports(response.data);
        setPagination(response.pagination);
      } else {
        toast.error('Gagal memuat laporan');
      }
    } catch (error) {
      console.error('Load reports error:', error);
      toast.error('Terjadi kesalahan saat memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = () => {
    setEditingReport(null);
    setShowForm(true);
    setViewMode('list');
    setViewingReport(null);
    toast.success('Form laporan baru dibuka');
  };

  const handleEditReport = (report: FinancialReport) => {
    setEditingReport(report);
    setShowForm(true);
    setViewMode('list');
    setViewingReport(null);
    toast.success(`Mengedit laporan ${report.period}`);
  };

  const handleViewReport = (report: FinancialReport, mode: 'detail' | 'balance' | 'tax') => {
    setViewingReport(report);
    setViewMode(mode);
    setShowForm(false);
    setEditingReport(null);
    toast.success(`Menampilkan ${mode === 'detail' ? 'detail' : mode === 'balance' ? 'neraca' : 'perhitungan pajak'} laporan ${report.period}`);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setViewingReport(null);
    setShowForm(false);
    setEditingReport(null);
    toast.success('Kembali ke daftar laporan');
  };

  const handleDeleteReport = (reportId: string) => {
    setShowDeleteModal(reportId);
  };

  const confirmDelete = async () => {
    if (showDeleteModal) {
      try {
        const response = await apiClient.deleteReport(showDeleteModal);
        if (response.success) {
          const report = reports.find(r => r._id === showDeleteModal);
          toast.success(`Laporan ${report?.period} berhasil dihapus`);
          loadReports(); // Reload reports
        } else {
          toast.error('Gagal menghapus laporan');
        }
      } catch (error) {
        console.error('Delete report error:', error);
        toast.error('Terjadi kesalahan saat menghapus laporan');
      }
      setShowDeleteModal(null);
    }
  };

  const handleApproveReport = (report: FinancialReport) => {
    setShowApprovalModal(report);
  };

  const confirmApproval = async () => {
    if (showApprovalModal) {
      try {
        const response = await apiClient.approveReport(showApprovalModal._id);
        if (response.success) {
          toast.success(`Laporan ${showApprovalModal.period} berhasil disetujui`);
          loadReports(); // Reload reports
        } else {
          toast.error('Gagal menyetujui laporan');
        }
      } catch (error) {
        console.error('Approve report error:', error);
        toast.error('Terjadi kesalahan saat menyetujui laporan');
      }
      setShowApprovalModal(null);
    }
  };

  const handleSubmitReport = async (reportId: string) => {
    try {
      const response = await apiClient.submitReport(reportId);
      if (response.success) {
        const report = reports.find(r => r._id === reportId);
        toast.success(`Laporan ${report?.period} berhasil diajukan untuk persetujuan`);
        loadReports(); // Reload reports
      } else {
        toast.error('Gagal mengajukan laporan');
      }
    } catch (error) {
      console.error('Submit report error:', error);
      toast.error('Terjadi kesalahan saat mengajukan laporan');
    }
  };

  const handleArchiveReport = async (reportId: string) => {
    try {
      const response = await apiClient.archiveReport(reportId);
      if (response.success) {
        const report = reports.find(r => r._id === reportId);
        toast.success(`Laporan ${report?.period} berhasil diarsipkan`);
        loadReports(); // Reload reports
      } else {
        toast.error('Gagal mengarsipkan laporan');
      }
    } catch (error) {
      console.error('Archive report error:', error);
      toast.error('Terjadi kesalahan saat mengarsipkan laporan');
    }
  };

  const handleDuplicateReport = async (report: FinancialReport) => {
    try {
      const response = await apiClient.duplicateReport(report._id);
      if (response.success) {
        toast.success(`Laporan ${report.period} berhasil diduplikasi`);
        loadReports(); // Reload reports
      } else {
        toast.error('Gagal menduplikasi laporan');
      }
    } catch (error) {
      console.error('Duplicate report error:', error);
      toast.error('Terjadi kesalahan saat menduplikasi laporan');
    }
  };

  const handleSaveReport = async (reportData: Partial<FinancialReport>) => {
    try {
      let response;
      
      if (editingReport) {
        // Update existing report
        response = await apiClient.updateReport(editingReport._id, reportData);
        if (response.success) {
          toast.success(`Laporan ${reportData.period} berhasil diperbarui`);
        }
      } else {
        // Create new report
        response = await apiClient.createReport(reportData);
        if (response.success) {
          toast.success(`Laporan ${reportData.period} berhasil dibuat`);
        }
      }

      if (response.success) {
        setShowForm(false);
        setEditingReport(null);
        setViewMode('list');
        loadReports(); // Reload reports
      } else {
        toast.error(response.message || 'Gagal menyimpan laporan');
      }
    } catch (error) {
      console.error('Save report error:', error);
      toast.error('Terjadi kesalahan saat menyimpan laporan');
    }
  };

  const handleExportReport = async (report: FinancialReport, format: 'pdf' | 'excel') => {
    try {
      if (format === 'pdf') {
        exportToPDF(report);
      } else {
        exportToExcel([report]);
      }
      toast.success(`Laporan ${report.period} berhasil diekspor ke ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Gagal mengekspor laporan ke ${format.toUpperCase()}`);
    }
  };

  const handleBulkExport = () => {
    try {
      exportToExcel(reports);
      toast.success(`${reports.length} laporan berhasil diekspor ke Excel`);
    } catch (error) {
      toast.error('Gagal mengekspor laporan');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateTotals = (report: FinancialReport) => {
    const totalRevenue = Object.values(report.revenue).reduce((a, b) => a + b, 0);
    const totalExpenses = Object.values(report.expenses).reduce((a, b) => a + b, 0);
    const netProfit = totalRevenue - totalExpenses;
    
    return { totalRevenue, totalExpenses, netProfit };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="h-4 w-4" />;
      case 'submitted':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'archived':
        return <FileText className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Show form
  if (showForm) {
    return (
      <ReportForm
        report={editingReport || undefined}
        onSave={handleSaveReport}
        onCancel={handleBackToList}
      />
    );
  }

  // Show detail view
  if (viewMode === 'detail' && viewingReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('detail')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Detail
            </button>
            <button
              onClick={() => setViewMode('balance')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Neraca
            </button>
            <button
              onClick={() => setViewMode('tax')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Perhitungan Pajak
            </button>
          </div>
        </div>
        <ReportDetailView report={viewingReport} />
      </div>
    );
  }

  // Show balance sheet view
  if (viewMode === 'balance' && viewingReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('detail')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Detail
            </button>
            <button
              onClick={() => setViewMode('balance')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Neraca
            </button>
            <button
              onClick={() => setViewMode('tax')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Perhitungan Pajak
            </button>
          </div>
        </div>
        <BalanceSheetView report={viewingReport} />
      </div>
    );
  }

  // Show tax calculation view
  if (viewMode === 'tax' && viewingReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('detail')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Detail
            </button>
            <button
              onClick={() => setViewMode('balance')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Neraca
            </button>
            <button
              onClick={() => setViewMode('tax')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Perhitungan Pajak
            </button>
          </div>
        </div>
        <TaxCalculationView report={viewingReport} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show main list view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan Keuangan</h1>
          <p className="text-gray-600 mt-1">Kelola dan lihat semua laporan keuangan rumah sakit</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleBulkExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export Semua
          </button>
          <button
            onClick={handleCreateReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Buat Laporan Baru
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Laporan</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Menunggu Persetujuan</p>
              <p className="text-2xl font-bold text-yellow-600">{reports.filter(r => r.status === 'submitted').length}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disetujui</p>
              <p className="text-2xl font-bold text-green-600">{reports.filter(r => r.status === 'approved').length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-600">{reports.filter(r => r.status === 'draft').length}</p>
            </div>
            <Edit className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari Laporan
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari berdasarkan periode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Laporan
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Tipe</option>
              <option value="monthly">Bulanan</option>
              <option value="quarterly">Kuartalan</option>
              <option value="annual">Tahunan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Diajukan</option>
              <option value="approved">Disetujui</option>
              <option value="archived">Diarsipkan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahun
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Tahun</option>
              {Array.from(new Set(reports.map(r => r.year))).sort().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urutkan
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="period">Periode</option>
              <option value="revenue">Pendapatan</option>
              <option value="profit">Keuntungan</option>
              <option value="created">Tanggal Dibuat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urutan
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Terbaru</option>
              <option value="asc">Terlama</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Periode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Pendapatan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Pengeluaran
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Laba Bersih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => {
                const { totalRevenue, totalExpenses, netProfit } = calculateTotals(report);
                return (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.period}</div>
                      <div className="text-xs text-gray-500">
                        Dibuat: {new Date(report.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        report.reportType === 'monthly' ? 'bg-blue-100 text-blue-800' :
                        report.reportType === 'quarterly' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {report.reportType === 'monthly' ? 'Bulanan' :
                         report.reportType === 'quarterly' ? 'Kuartalan' : 'Tahunan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(totalRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(totalExpenses)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(netProfit)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          report.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          report.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {report.status === 'draft' ? 'Draft' :
                           report.status === 'submitted' ? 'Diajukan' :
                           report.status === 'approved' ? 'Disetujui' : 'Diarsipkan'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewReport(report, 'detail')}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Lihat Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleViewReport(report, 'balance')}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                          title="Lihat Neraca"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleViewReport(report, 'tax')}
                          className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50"
                          title="Perhitungan Pajak"
                        >
                          <Calculator className="h-4 w-4" />
                        </button>
                        {report.status === 'draft' && (
                          <button
                            onClick={() => handleEditReport(report)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleExportReport(report, 'pdf')}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Export PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {report.status === 'draft' && (
                          <button
                            onClick={() => handleSubmitReport(report._id)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                            title="Ajukan"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {report.status === 'submitted' && (
                          <button
                            onClick={() => handleApproveReport(report)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Setujui"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReport(report._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} laporan
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}

        {reports.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada laporan ditemukan</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterType !== 'all' || selectedYear !== 'all' 
                ? 'Coba ubah filter pencarian Anda'
                : 'Mulai dengan membuat laporan keuangan pertama Anda'
              }
            </p>
            {!searchTerm && filterType === 'all' && selectedYear === 'all' && (
              <button
                onClick={handleCreateReport}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Buat Laporan Baru
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Hapus</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Confirmation Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Persetujuan</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menyetujui laporan {showApprovalModal.period}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmApproval}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Setujui
              </button>
              <button
                onClick={() => setShowApprovalModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;