import FinancialReport from '../models/FinancialReport.js';
import mongoose from 'mongoose';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const currentYear = new Date().getFullYear();

    // Get latest report
    const latestReport = await FinancialReport.findOne({ 
      hospitalId,
      status: { $in: ['approved', 'submitted'] }
    }).sort({ createdAt: -1 });

    if (!latestReport) {
      return res.status(200).json({
        success: true,
        data: {
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          totalAssets: 0,
          totalLiabilities: 0,
          totalEquity: 0,
          taxAmount: 0,
          revenueGrowth: 0,
          profitMargin: 0,
          currentRatio: 0,
          debtToEquityRatio: 0
        }
      });
    }

    // Calculate totals from latest report
    const totalRevenue = Object.values(latestReport.revenue).reduce((a, b) => a + b, 0);
    const totalExpenses = Object.values(latestReport.expenses).reduce((a, b) => a + b, 0);
    const netProfit = totalRevenue - totalExpenses;
    
    const totalCurrentAssets = Object.values(latestReport.assets.current).reduce((a, b) => a + b, 0);
    const totalFixedAssets = Object.values(latestReport.assets.fixed).reduce((a, b) => a + b, 0);
    const totalAssets = totalCurrentAssets + totalFixedAssets;
    
    const totalCurrentLiabilities = Object.values(latestReport.liabilities.current).reduce((a, b) => a + b, 0);
    const totalLongTermLiabilities = Object.values(latestReport.liabilities.longTerm).reduce((a, b) => a + b, 0);
    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;
    
    const totalEquity = latestReport.equity.capital + latestReport.equity.retainedEarnings + latestReport.equity.currentEarnings;

    // Calculate growth (compare with previous period)
    const previousReport = await FinancialReport.findOne({
      hospitalId,
      status: { $in: ['approved', 'submitted'] },
      _id: { $ne: latestReport._id }
    }).sort({ createdAt: -1 });

    let revenueGrowth = 0;
    if (previousReport) {
      const previousRevenue = Object.values(previousReport.revenue).reduce((a, b) => a + b, 0);
      if (previousRevenue > 0) {
        revenueGrowth = ((totalRevenue - previousRevenue) / previousRevenue) * 100;
      }
    }

    // Calculate ratios
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const currentRatio = totalCurrentLiabilities > 0 ? totalCurrentAssets / totalCurrentLiabilities : 0;
    const debtToEquityRatio = totalEquity > 0 ? totalLiabilities / totalEquity : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalExpenses,
        netProfit,
        totalAssets,
        totalLiabilities,
        totalEquity,
        taxAmount: latestReport.tax.amount,
        revenueGrowth,
        profitMargin,
        currentRatio,
        debtToEquityRatio
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get revenue chart data
// @route   GET /api/dashboard/charts/revenue
// @access  Private
export const getRevenueChart = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const reports = await FinancialReport.find({
      hospitalId,
      year,
      status: { $in: ['approved', 'submitted'] }
    }).sort({ month: 1, quarter: 1 });

    const chartData = reports.map(report => ({
      name: report.period,
      value: Object.values(report.revenue).reduce((a, b) => a + b, 0) / 1000000, // Convert to millions
      breakdown: {
        patientCare: report.revenue.patientCare / 1000000,
        emergencyServices: report.revenue.emergencyServices / 1000000,
        surgery: report.revenue.surgery / 1000000,
        laboratory: report.revenue.laboratory / 1000000,
        pharmacy: report.revenue.pharmacy / 1000000,
        other: report.revenue.other / 1000000
      }
    }));

    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Get revenue chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get expense chart data
// @route   GET /api/dashboard/charts/expenses
// @access  Private
export const getExpenseChart = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const reports = await FinancialReport.find({
      hospitalId,
      year,
      status: { $in: ['approved', 'submitted'] }
    }).sort({ month: 1, quarter: 1 });

    const chartData = reports.map(report => ({
      name: report.period,
      value: Object.values(report.expenses).reduce((a, b) => a + b, 0) / 1000000, // Convert to millions
      breakdown: {
        salaries: report.expenses.salaries / 1000000,
        medicalSupplies: report.expenses.medicalSupplies / 1000000,
        equipment: report.expenses.equipment / 1000000,
        utilities: report.expenses.utilities / 1000000,
        maintenance: report.expenses.maintenance / 1000000,
        insurance: report.expenses.insurance / 1000000,
        other: report.expenses.other / 1000000
      }
    }));

    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Get expense chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get profit chart data
// @route   GET /api/dashboard/charts/profit
// @access  Private
export const getProfitChart = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const reports = await FinancialReport.find({
      hospitalId,
      year,
      status: { $in: ['approved', 'submitted'] }
    }).sort({ month: 1, quarter: 1 });

    const chartData = reports.map(report => {
      const revenue = Object.values(report.revenue).reduce((a, b) => a + b, 0);
      const expenses = Object.values(report.expenses).reduce((a, b) => a + b, 0);
      const profit = revenue - expenses;
      
      return {
        name: report.period,
        profit: profit / 1000000, // Convert to millions
        revenue: revenue / 1000000,
        expenses: expenses / 1000000,
        margin: revenue > 0 ? (profit / revenue) * 100 : 0
      };
    });

    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Get profit chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get balance sheet chart data
// @route   GET /api/dashboard/charts/balance-sheet
// @access  Private
export const getBalanceSheetChart = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    const latestReport = await FinancialReport.findOne({
      hospitalId,
      status: { $in: ['approved', 'submitted'] }
    }).sort({ createdAt: -1 });

    if (!latestReport) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const totalAssets = Object.values(latestReport.assets.current).reduce((a, b) => a + b, 0) + 
                      Object.values(latestReport.assets.fixed).reduce((a, b) => a + b, 0);
    const totalLiabilities = Object.values(latestReport.liabilities.current).reduce((a, b) => a + b, 0) + 
                           Object.values(latestReport.liabilities.longTerm).reduce((a, b) => a + b, 0);
    const totalEquity = latestReport.equity.capital + latestReport.equity.retainedEarnings + latestReport.equity.currentEarnings;

    const chartData = [
      { name: 'Aset', value: totalAssets / 1000000000, color: '#3B82F6' },
      { name: 'Kewajiban', value: totalLiabilities / 1000000000, color: '#EF4444' },
      { name: 'Ekuitas', value: totalEquity / 1000000000, color: '#10B981' }
    ];

    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Get balance sheet chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get financial ratios
// @route   GET /api/dashboard/ratios
// @access  Private
export const getFinancialRatios = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    const latestReport = await FinancialReport.findOne({
      hospitalId,
      status: { $in: ['approved', 'submitted'] }
    }).sort({ createdAt: -1 });

    if (!latestReport) {
      return res.status(200).json({
        success: true,
        data: {
          currentRatio: 0,
          debtToEquityRatio: 0,
          profitMargin: 0,
          assetTurnover: 0,
          returnOnAssets: 0,
          returnOnEquity: 0
        }
      });
    }

    const totalRevenue = Object.values(latestReport.revenue).reduce((a, b) => a + b, 0);
    const totalExpenses = Object.values(latestReport.expenses).reduce((a, b) => a + b, 0);
    const netProfit = totalRevenue - totalExpenses;
    
    const totalCurrentAssets = Object.values(latestReport.assets.current).reduce((a, b) => a + b, 0);
    const totalAssets = totalCurrentAssets + Object.values(latestReport.assets.fixed).reduce((a, b) => a + b, 0);
    const totalCurrentLiabilities = Object.values(latestReport.liabilities.current).reduce((a, b) => a + b, 0);
    const totalLiabilities = totalCurrentLiabilities + Object.values(latestReport.liabilities.longTerm).reduce((a, b) => a + b, 0);
    const totalEquity = latestReport.equity.capital + latestReport.equity.retainedEarnings + latestReport.equity.currentEarnings;

    const ratios = {
      currentRatio: totalCurrentLiabilities > 0 ? totalCurrentAssets / totalCurrentLiabilities : 0,
      debtToEquityRatio: totalEquity > 0 ? totalLiabilities / totalEquity : 0,
      profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      assetTurnover: totalAssets > 0 ? totalRevenue / totalAssets : 0,
      returnOnAssets: totalAssets > 0 ? (netProfit / totalAssets) * 100 : 0,
      returnOnEquity: totalEquity > 0 ? (netProfit / totalEquity) * 100 : 0
    };

    res.status(200).json({
      success: true,
      data: ratios
    });
  } catch (error) {
    console.error('Get financial ratios error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get comparative analysis
// @route   GET /api/dashboard/analysis
// @access  Private
export const getComparativeAnalysis = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    const currentYearReports = await FinancialReport.find({
      hospitalId,
      year: currentYear,
      status: { $in: ['approved', 'submitted'] }
    });

    const previousYearReports = await FinancialReport.find({
      hospitalId,
      year: previousYear,
      status: { $in: ['approved', 'submitted'] }
    });

    const calculateTotals = (reports) => {
      return reports.reduce((totals, report) => {
        const revenue = Object.values(report.revenue).reduce((a, b) => a + b, 0);
        const expenses = Object.values(report.expenses).reduce((a, b) => a + b, 0);
        
        return {
          revenue: totals.revenue + revenue,
          expenses: totals.expenses + expenses,
          profit: totals.profit + (revenue - expenses)
        };
      }, { revenue: 0, expenses: 0, profit: 0 });
    };

    const currentTotals = calculateTotals(currentYearReports);
    const previousTotals = calculateTotals(previousYearReports);

    const analysis = {
      currentYear: {
        year: currentYear,
        ...currentTotals
      },
      previousYear: {
        year: previousYear,
        ...previousTotals
      },
      growth: {
        revenue: previousTotals.revenue > 0 ? 
          ((currentTotals.revenue - previousTotals.revenue) / previousTotals.revenue) * 100 : 0,
        expenses: previousTotals.expenses > 0 ? 
          ((currentTotals.expenses - previousTotals.expenses) / previousTotals.expenses) * 100 : 0,
        profit: previousTotals.profit > 0 ? 
          ((currentTotals.profit - previousTotals.profit) / previousTotals.profit) * 100 : 0
      }
    };

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Get comparative analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
// @access  Private
export const getRecentActivity = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    const recentReports = await FinancialReport.find({ hospitalId })
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ updatedAt: -1 })
      .limit(10);

    const activities = recentReports.map(report => ({
      id: report._id,
      type: 'report',
      action: report.status === 'approved' ? 'approved' : 
              report.status === 'submitted' ? 'submitted' : 'created',
      description: `Report ${report.period} was ${report.status}`,
      user: report.status === 'approved' ? report.approvedBy : report.createdBy,
      timestamp: report.updatedAt,
      data: {
        reportId: report._id,
        period: report.period,
        status: report.status
      }
    }));

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};