import ReviewSchedule from '../models/ReviewSchedule.js';
import FinancialReport from '../models/FinancialReport.js';

// @desc    Get all schedules
// @route   GET /api/schedules
// @access  Private
export const getSchedules = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { hospitalId: req.user.hospitalId };
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.reviewType) {
      filter.reviewType = req.query.reviewType;
    }
    
    if (req.query.assignedTo) {
      filter.assignedTo = req.query.assignedTo;
    }

    const schedules = await ReviewSchedule.find(filter)
      .populate('reportId', 'period reportType')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ReviewSchedule.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: schedules,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single schedule
// @route   GET /api/schedules/:id
// @access  Private
export const getSchedule = async (req, res) => {
  try {
    const schedule = await ReviewSchedule.findById(req.params.id)
      .populate('reportId', 'period reportType')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email')
      .populate('reviewComments.commentedBy', 'name email');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Check hospital access
    if (req.user.role !== 'admin' && schedule.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new schedule
// @route   POST /api/schedules
// @access  Private
export const createSchedule = async (req, res) => {
  try {
    // Verify report exists and belongs to hospital
    const report = await FinancialReport.findById(req.body.reportId);
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

    // Add hospital ID and creator
    req.body.hospitalId = req.user.hospitalId;
    req.body.createdBy = req.user.id;

    const schedule = await ReviewSchedule.create(req.body);

    const populatedSchedule = await ReviewSchedule.findById(schedule._id)
      .populate('reportId', 'period reportType')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: populatedSchedule
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Private
export const updateSchedule = async (req, res) => {
  try {
    let schedule = await ReviewSchedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Check hospital access
    if (req.user.role !== 'admin' && schedule.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if user can edit (creator, assigned user, or admin)
    const canEdit = schedule.createdBy.toString() === req.user.id ||
                   schedule.assignedTo.toString() === req.user.id ||
                   req.user.role === 'admin';

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this schedule'
      });
    }

    schedule = await ReviewSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('reportId', 'period reportType')
     .populate('assignedTo', 'name email')
     .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark schedule as completed
// @route   PATCH /api/schedules/:id/complete
// @access  Private
export const markCompleted = async (req, res) => {
  try {
    const schedule = await ReviewSchedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Check hospital access
    if (req.user.role !== 'admin' && schedule.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if user can complete (assigned user or admin)
    const canComplete = schedule.assignedTo.toString() === req.user.id ||
                       req.user.role === 'admin';

    if (!canComplete) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this schedule'
      });
    }

    if (schedule.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Schedule is already completed'
      });
    }

    await schedule.markCompleted(req.user.id);

    const updatedSchedule = await ReviewSchedule.findById(schedule._id)
      .populate('reportId', 'period reportType')
      .populate('assignedTo', 'name email')
      .populate('completedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Schedule marked as completed',
      data: updatedSchedule
    });
  } catch (error) {
    console.error('Mark completed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add comment to schedule
// @route   POST /api/schedules/:id/comment
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    const schedule = await ReviewSchedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Check hospital access
    if (req.user.role !== 'admin' && schedule.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await schedule.addComment(comment.trim(), req.user.id);

    const updatedSchedule = await ReviewSchedule.findById(schedule._id)
      .populate('reportId', 'period reportType')
      .populate('assignedTo', 'name email')
      .populate('reviewComments.commentedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: updatedSchedule
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get upcoming schedules
// @route   GET /api/schedules/upcoming
// @access  Private
export const getUpcomingSchedules = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const schedules = await ReviewSchedule.find({
      hospitalId: req.user.hospitalId,
      scheduledDate: {
        $gte: new Date(),
        $lte: endDate
      },
      status: { $in: ['pending', 'in-progress'] }
    })
    .populate('reportId', 'period reportType')
    .populate('assignedTo', 'name email')
    .sort({ scheduledDate: 1 })
    .limit(10);

    res.status(200).json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Get upcoming schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get overdue schedules
// @route   GET /api/schedules/overdue
// @access  Private
export const getOverdueSchedules = async (req, res) => {
  try {
    const schedules = await ReviewSchedule.find({
      hospitalId: req.user.hospitalId,
      scheduledDate: { $lt: new Date() },
      status: { $in: ['pending', 'in-progress'] }
    })
    .populate('reportId', 'period reportType')
    .populate('assignedTo', 'name email')
    .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Get overdue schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Private
export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await ReviewSchedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Check hospital access
    if (req.user.role !== 'admin' && schedule.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if user can delete (creator or admin)
    const canDelete = schedule.createdBy.toString() === req.user.id ||
                     req.user.role === 'admin';

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this schedule'
      });
    }

    await ReviewSchedule.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};