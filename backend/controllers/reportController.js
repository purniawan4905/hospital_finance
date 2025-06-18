import FinancialReport from '../models/FinancialReport.js';
import mongoose from 'mongoose';

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private
export const getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { hospitalId: req.user.hospitalId };
    
    if (req.query.reportType) {
      filter.reportType = req.query.reportType;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.year) {
      filter.year = parseInt(req.query.year);
    }
    
    if (req.query.search) {
      filter.period = { $regex: req.query.search, $options: 'i' };
    }

    // Build sort
    let sort = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort[req.query.sortBy] = sortOrder;
    } else {
      sort = { createdAt: -1 };
    }

    const reports = await FinancialReport.find(filter)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await FinancialReport.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
export const getReport = async (req, res) => {
  try {
    const report = await FinancialReport.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check hospital access
    if (req.user.role !== 'admin' && report.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new report
// @route   POST /api/reports
// @access  Private
export const createReport = async (req, res) => {
  try {
    // Add user and hospital info
    req.body.createdBy = req.user.id;
    req.body.hospitalId = req.user.hospitalId;

    // Generate period string
    let period = '';
    if (req.body.reportType === 'monthly') {
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      period = `${months[req.body.month - 1]} ${req.body.year}`;
    } else if (req.body.reportType === 'quarterly') {
      period = `Q${req.body.quarter} ${req.body.year}`;
    } else {
      period = `${req.body.year}`;
    }
    req.body.period = period;

    const report = await FinancialReport.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: report
    });
  } catch (error) {
    console.error('Create report error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Report for this period already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update report
// @route   PUT /api/reports/:id
// @access  Private
export const updateReport = async (req, res) => {
  try {
    let report = await FinancialReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check hospital access
    if (req.user.role !== 'admin' && report.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if report can be edited
    if (report.status === 'approved' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot edit approved report'
      });
    }

    // Update period if needed
    if (req.body.reportType || req.body.year || req.body.month || req.body.quarter) {
      const reportType = req.body.reportType || report.reportType;
      const year = req.body.year || report.year;
      const month = req.body.month || report.month;
      const quarter = req.body.quarter || report.quarter;

      let period = '';
      if (reportType === 'monthly') {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        period = `${months[month - 1]} ${year}`;
      } else if (reportType === 'quarterly') {
        period = `Q${quarter} ${year}`;
      } else {
        period = `${year}`;
      }
      req.body.period = period;
    }

    report = await FinancialReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('approvedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: report
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Submit report for approval
// @route   PATCH /api/reports/:id/submit
// @access  Private
export const submitReport = async (req, res) => {
  try {
    const report = await FinancialReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check hospital access
    if (req.user.role !== 'admin' && report.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (report.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft reports can be submitted'
      });
    }

    report.status = 'submitted';
    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report submitted for approval',
      data: report
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Approve report
// @route   PATCH /api/reports/:id/approve
// @access  Private
export const approveReport = async (req, res) => {
  try {
    const report = await FinancialReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check hospital access
    if (req.user.role !== 'admin' && report.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (report.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Only submitted reports can be approved'
      });
    }

    report.status = 'approved';
    report.approvedBy = req.user.id;
    report.approvedAt = new Date();
    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report approved successfully',
      data: report
    });
  } catch (error) {
    console.error('Approve report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Archive report
// @route   PATCH /api/reports/:id/archive
// @access  Private
export const archiveReport = async (req, res) => {
  try {
    const report = await FinancialReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check hospital access
    if (req.user.role !== 'admin' && report.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    report.status = 'archived';
    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report archived successfully',
      data: report
    });
  } catch (error) {
    console.error('Archive report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Duplicate report
// @route   POST /api/reports/:id/duplicate
// @access  Private
export const duplicateReport = async (req, res) => {
  try {
    const originalReport = await FinancialReport.findById(req.params.id);

    if (!originalReport) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check hospital access
    if (req.user.role !== 'admin' && originalReport.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create duplicate
    const reportData = originalReport.toObject();
    delete reportData._id;
    delete reportData.createdAt;
    delete reportData.updatedAt;
    delete reportData.approvedBy;
    delete reportData.approvedAt;
    
    reportData.period = `${reportData.period} (Copy)`;
    reportData.status = 'draft';
    reportData.createdBy = req.user.id;
    reportData.previousVersionId = originalReport._id;

    const duplicatedReport = await FinancialReport.create(reportData);

    res.status(201).json({
      success: true,
      message: 'Report duplicated successfully',
      data: duplicatedReport
    });
  } catch (error) {
    console.error('Duplicate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
export const deleteReport = async (req, res) => {
  try {
    const report = await FinancialReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check hospital access
    if (req.user.role !== 'admin' && report.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if report can be deleted
    if (report.status === 'approved' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete approved report'
      });
    }

    await FinancialReport.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get report statistics
// @route   GET /api/reports/stats
// @access  Private
export const getReportStats = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    const stats = await FinancialReport.aggregate([
      { $match: { hospitalId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalReports = await FinancialReport.countDocuments({ hospitalId });
    
    const recentReports = await FinancialReport.find({ hospitalId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      data: {
        totalReports,
        statusBreakdown: stats,
        recentReports
      }
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Export report
// @route   GET /api/reports/:id/export
// @access  Private
export const exportReport = async (req, res) => {
  try {
    const report = await FinancialReport.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check hospital access
    if (req.user.role !== 'admin' && report.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Return report data for export
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};