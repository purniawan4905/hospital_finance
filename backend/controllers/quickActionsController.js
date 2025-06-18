import ReviewSchedule from '../models/ReviewSchedule.js';
import FinancialReport from '../models/FinancialReport.js';
import ArchiveLog from '../models/ArchiveLog.js';
import FinancialAnalysis from '../models/FinancialAnalysis.js';
import User from '../models/User.js';

// @desc    Create review schedule
// @route   POST /api/quick-actions/schedule-review
// @access  Private
export const createReviewSchedule = async (req, res) => {
  try {
    const { reportId, scheduledDate, reviewType, assignedTo, notes, priority } = req.body;

    // Verify report exists and belongs to hospital
    const report = await FinancialReport.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this report'
      });
    }

    // Verify assigned user exists
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(404).json({
        success: false,
        message: 'Assigned user not found'
      });
    }

    // Create schedule
    const schedule = await ReviewSchedule.create({
      reportId,
      hospitalId: req.user.hospitalId,
      scheduledDate: new Date(scheduledDate),
      reviewType,
      assignedTo,
      notes,
      priority: priority || 'medium',
      createdBy: req.user.id
    });

    const populatedSchedule = await ReviewSchedule.findById(schedule._id)
      .populate('reportId', 'period reportType')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Review schedule created successfully',
      data: populatedSchedule
    });
  } catch (error) {
    console.error('Create review schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get review schedules
// @route   GET /api/quick-actions/schedules
// @access  Private
export const getReviewSchedules = async (req, res) => {
  try {
    const { status, limit = 10 } = req.query;
    
    const filter = { hospitalId: req.user.hospitalId };
    if (status) {
      filter.status = status;
    }

    const schedules = await ReviewSchedule.find(filter)
      .populate('reportId', 'period reportType')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ scheduledDate: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Get review schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update schedule status
// @route   PATCH /api/quick-actions/schedule/:id/status
// @access  Private
export const updateScheduleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const schedule = await ReviewSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    if (schedule.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (status === 'completed') {
      await schedule.markCompleted(req.user.id);
    } else {
      schedule.status = status;
      await schedule.save();
    }

    const updatedSchedule = await ReviewSchedule.findById(id)
      .populate('reportId', 'period reportType')
      .populate('assignedTo', 'name email')
      .populate('completedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Schedule status updated successfully',
      data: updatedSchedule
    });
  } catch (error) {
    console.error('Update schedule status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Archive old reports
// @route   POST /api/quick-actions/archive-reports
// @access  Private
export const archiveOldReports = async (req, res) => {
  try {
    const { monthsOld = 24, archiveReason } = req.body;
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsOld);

    // Find reports to archive
    const reportsToArchive = await FinancialReport.find({
      hospitalId: req.user.hospitalId,
      status: { $in: ['approved'] },
      createdAt: { $lt: cutoffDate }
    });

    if (reportsToArchive.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No reports found to archive',
        data: {
          totalArchived: 0,
          reports: []
        }
      });
    }

    // Create archive log
    const archiveLog = await ArchiveLog.create({
      hospitalId: req.user.hospitalId,
      archiveType: 'manual',
      archivedReports: reportsToArchive.map(report => ({
        reportId: report._id,
        reportPeriod: report.period,
        reportType: report.reportType
      })),
      totalReportsArchived: reportsToArchive.length,
      archiveReason: archiveReason || 'Manual archive of old reports',
      archivedBy: req.user.id,
      status: 'in-progress'
    });

    // Update reports status to archived
    await FinancialReport.updateMany(
      { _id: { $in: reportsToArchive.map(r => r._id) } },
      { status: 'archived' }
    );

    // Update archive log
    archiveLog.status = 'completed';
    archiveLog.completedAt = new Date();
    await archiveLog.save();

    const populatedLog = await ArchiveLog.findById(archiveLog._id)
      .populate('archivedBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Successfully archived ${reportsToArchive.length} reports`,
      data: {
        totalArchived: reportsToArchive.length,
        archiveLog: populatedLog,
        reports: reportsToArchive.map(r => ({
          id: r._id,
          period: r.period,
          type: r.reportType
        }))
      }
    });
  } catch (error) {
    console.error('Archive reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Generate financial analysis
// @route   POST /api/quick-actions/financial-analysis
// @access  Private
export const generateFinancialAnalysis = async (req, res) => {
  try {
    const { analysisType = 'performance', months = 12 } = req.body;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Get reports for analysis
    const reports = await FinancialReport.find({
      hospitalId: req.user.hospitalId,
      status: { $in: ['approved'] },
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: 1 });

    if (reports.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient data for analysis. At least 2 approved reports are required.'
      });
    }

    // Calculate metrics
    const latestReport = reports[reports.length - 1];
    const previousReport = reports[reports.length - 2];

    const currentRevenue = Object.values(latestReport.revenue).reduce((a, b) => a + b, 0);
    const previousRevenue = Object.values(previousReport.revenue).reduce((a, b) => a + b, 0);
    const currentExpenses = Object.values(latestReport.expenses).reduce((a, b) => a + b, 0);
    const previousExpenses = Object.values(previousReport.expenses).reduce((a, b) => a + b, 0);

    const currentProfit = currentRevenue - currentExpenses;
    const previousProfit = previousRevenue - previousExpenses;

    const currentAssets = Object.values(latestReport.assets.current).reduce((a, b) => a + b, 0) +
                         Object.values(latestReport.assets.fixed).reduce((a, b) => a + b, 0);
    const currentLiabilities = Object.values(latestReport.liabilities.current).reduce((a, b) => a + b, 0) +
                              Object.values(latestReport.liabilities.longTerm).reduce((a, b) => a + b, 0);
    const currentEquity = latestReport.equity.capital + latestReport.equity.retainedEarnings + latestReport.equity.currentEarnings;

    // Generate insights
    const insights = [];
    const trends = [];
    const forecasts = [];

    // Revenue growth analysis
    const revenueGrowth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    if (revenueGrowth > 10) {
      insights.push({
        category: 'positive',
        title: 'Strong Revenue Growth',
        description: `Revenue increased by ${revenueGrowth.toFixed(1)}% compared to previous period`,
        impact: 'high',
        recommendation: 'Continue current growth strategies and consider expansion opportunities'
      });
    } else if (revenueGrowth < -5) {
      insights.push({
        category: 'negative',
        title: 'Revenue Decline',
        description: `Revenue decreased by ${Math.abs(revenueGrowth).toFixed(1)}% compared to previous period`,
        impact: 'high',
        recommendation: 'Review pricing strategy and market positioning'
      });
    }

    trends.push({
      metric: 'Revenue',
      direction: revenueGrowth > 0 ? 'increasing' : 'decreasing',
      percentage: Math.abs(revenueGrowth),
      significance: Math.abs(revenueGrowth) > 10 ? 'significant' : Math.abs(revenueGrowth) > 5 ? 'moderate' : 'minor'
    });

    // Profitability analysis
    const profitMargin = (currentProfit / currentRevenue) * 100;
    if (profitMargin > 15) {
      insights.push({
        category: 'positive',
        title: 'Healthy Profit Margin',
        description: `Current profit margin is ${profitMargin.toFixed(1)}%`,
        impact: 'medium',
        recommendation: 'Maintain operational efficiency and cost control'
      });
    } else if (profitMargin < 5) {
      insights.push({
        category: 'warning',
        title: 'Low Profit Margin',
        description: `Current profit margin is only ${profitMargin.toFixed(1)}%`,
        impact: 'high',
        recommendation: 'Review cost structure and operational efficiency'
      });
    }

    // Liquidity analysis
    const currentRatio = currentAssets / currentLiabilities;
    if (currentRatio < 1) {
      insights.push({
        category: 'negative',
        title: 'Liquidity Concern',
        description: `Current ratio is ${currentRatio.toFixed(2)}, indicating potential liquidity issues`,
        impact: 'high',
        recommendation: 'Improve cash flow management and consider debt restructuring'
      });
    }

    // Generate forecasts
    forecasts.push({
      metric: 'Revenue',
      currentValue: currentRevenue,
      projectedValue: currentRevenue * (1 + (revenueGrowth / 100)),
      timeframe: 'Next Period',
      confidence: Math.min(85, Math.max(60, 85 - Math.abs(revenueGrowth) / 2))
    });

    // Create analysis record
    const analysis = await FinancialAnalysis.create({
      hospitalId: req.user.hospitalId,
      analysisType,
      period: {
        startDate,
        endDate
      },
      reportIds: reports.map(r => r._id),
      metrics: {
        revenueGrowth: {
          current: currentRevenue,
          previous: previousRevenue,
          growthRate: revenueGrowth
        },
        profitability: {
          grossProfitMargin: profitMargin,
          netProfitMargin: profitMargin,
          operatingMargin: profitMargin
        },
        liquidity: {
          currentRatio: currentRatio,
          quickRatio: currentRatio * 0.8,
          cashRatio: currentRatio * 0.3
        },
        efficiency: {
          assetTurnover: currentRevenue / currentAssets,
          receivableTurnover: 12,
          inventoryTurnover: 8
        },
        leverage: {
          debtToEquity: currentLiabilities / currentEquity,
          debtToAssets: currentLiabilities / currentAssets,
          interestCoverage: 5.2
        }
      },
      insights,
      trends,
      forecasts,
      generatedBy: req.user.id,
      status: 'completed',
      completedAt: new Date()
    });

    const populatedAnalysis = await FinancialAnalysis.findById(analysis._id)
      .populate('generatedBy', 'name email')
      .populate('reportIds', 'period reportType');

    res.status(201).json({
      success: true,
      message: 'Financial analysis generated successfully',
      data: populatedAnalysis
    });
  } catch (error) {
    console.error('Generate financial analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get financial analyses
// @route   GET /api/quick-actions/analyses
// @access  Private
export const getFinancialAnalyses = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const analyses = await FinancialAnalysis.find({
      hospitalId: req.user.hospitalId,
      status: 'completed'
    })
    .populate('generatedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: analyses
    });
  } catch (error) {
    console.error('Get financial analyses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get archive logs
// @route   GET /api/quick-actions/archive-logs
// @access  Private
export const getArchiveLogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const logs = await ArchiveLog.find({
      hospitalId: req.user.hospitalId
    })
    .populate('archivedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get archive logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};