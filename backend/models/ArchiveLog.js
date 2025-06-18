import mongoose from 'mongoose';

const archiveLogSchema = new mongoose.Schema({
  hospitalId: {
    type: String,
    required: [true, 'Hospital ID is required'],
    trim: true
  },
  archiveType: {
    type: String,
    enum: ['manual', 'automatic', 'scheduled'],
    required: [true, 'Archive type is required']
  },
  archivedReports: [{
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FinancialReport',
      required: true
    },
    reportPeriod: String,
    reportType: String,
    archivedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalReportsArchived: {
    type: Number,
    required: true,
    min: 0
  },
  totalSizeBytes: {
    type: Number,
    default: 0
  },
  archiveReason: {
    type: String,
    maxlength: [500, 'Archive reason cannot exceed 500 characters']
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'failed'],
    default: 'pending'
  },
  completedAt: {
    type: Date
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
archiveLogSchema.index({ hospitalId: 1, createdAt: -1 });
archiveLogSchema.index({ archivedBy: 1 });
archiveLogSchema.index({ status: 1 });

export default mongoose.model('ArchiveLog', archiveLogSchema);