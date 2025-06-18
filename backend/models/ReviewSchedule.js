import mongoose from 'mongoose';

const reviewScheduleSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinancialReport',
    required: [true, 'Report ID is required']
  },
  hospitalId: {
    type: String,
    required: [true, 'Hospital ID is required'],
    trim: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  reviewType: {
    type: String,
    enum: ['monthly', 'quarterly', 'annual', 'audit', 'special'],
    required: [true, 'Review type is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned user is required']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'overdue', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  reviewComments: [{
    comment: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    commentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    commentedAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedAt: {
    type: Date
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remindersSent: [{
    sentAt: {
      type: Date,
      default: Date.now
    },
    sentTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reminderType: {
      type: String,
      enum: ['email', 'system', 'sms']
    }
  }],
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reviewScheduleSchema.index({ hospitalId: 1, scheduledDate: 1 });
reviewScheduleSchema.index({ assignedTo: 1, status: 1 });
reviewScheduleSchema.index({ reportId: 1 });
reviewScheduleSchema.index({ reviewType: 1 });
reviewScheduleSchema.index({ status: 1, scheduledDate: 1 });

// Virtual to check if review is overdue
reviewScheduleSchema.virtual('isOverdue').get(function() {
  return this.status !== 'completed' && this.status !== 'cancelled' && new Date() > this.scheduledDate;
});

// Pre-save middleware to update status if overdue
reviewScheduleSchema.pre('save', function(next) {
  if (this.isOverdue && this.status === 'pending') {
    this.status = 'overdue';
  }
  next();
});

// Method to mark as completed
reviewScheduleSchema.methods.markCompleted = function(userId) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.completedBy = userId;
  return this.save();
};

// Method to add comment
reviewScheduleSchema.methods.addComment = function(comment, userId) {
  this.reviewComments.push({
    comment,
    commentedBy: userId
  });
  return this.save();
};

// Ensure virtuals are included in JSON
reviewScheduleSchema.set('toJSON', { virtuals: true });
reviewScheduleSchema.set('toObject', { virtuals: true });

export default mongoose.model('ReviewSchedule', reviewScheduleSchema);