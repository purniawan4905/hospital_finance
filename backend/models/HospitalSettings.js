import mongoose from 'mongoose';

const hospitalSettingsSchema = new mongoose.Schema({
  hospitalId: {
    type: String,
    required: [true, 'Hospital ID is required'],
    // unique: true,
    trim: true
  },
  hospitalName: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
    maxlength: [200, 'Hospital name cannot exceed 200 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  taxId: {
    type: String,
    required: [true, 'Tax ID is required'],
    trim: true,
    // unique: true
  },
  fiscalYearStart: {
    type: Number,
    required: [true, 'Fiscal year start month is required'],
    min: [1, 'Month must be between 1 and 12'],
    max: [12, 'Month must be between 1 and 12']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: ['IDR', 'USD', 'EUR'],
    default: 'IDR'
  },
  taxSettings: {
    corporateTaxRate: {
      type: Number,
      required: [true, 'Corporate tax rate is required'],
      min: [0, 'Tax rate cannot be negative'],
      max: [1, 'Tax rate cannot exceed 100%'],
      default: 0.25
    },
    vatRate: {
      type: Number,
      required: [true, 'VAT rate is required'],
      min: [0, 'VAT rate cannot be negative'],
      max: [1, 'VAT rate cannot exceed 100%'],
      default: 0.11
    },
    withholdingTaxRate: {
      type: Number,
      required: [true, 'Withholding tax rate is required'],
      min: [0, 'Withholding tax rate cannot be negative'],
      max: [1, 'Withholding tax rate cannot exceed 100%'],
      default: 0.02
    },
    deductionTypes: [{
      type: String,
      trim: true
    }]
  },
  reportingSettings: {
    autoApproval: {
      type: Boolean,
      default: false
    },
    requireDualApproval: {
      type: Boolean,
      default: true
    },
    archiveAfterMonths: {
      type: Number,
      default: 24,
      min: [1, 'Archive period must be at least 1 month'],
      max: [120, 'Archive period cannot exceed 120 months']
    },
    reminderDays: [{
      type: Number,
      min: [1, 'Reminder days must be positive']
    }]
  },
  notificationSettings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    reminderDays: [{
      type: Number,
      default: [7, 3, 1]
    }],
    notifyRoles: [{
      type: String,
      enum: ['admin', 'finance', 'viewer']
    }]
  },
  securitySettings: {
    passwordMinLength: {
      type: Number,
      default: 8,
      min: [6, 'Password minimum length must be at least 6'],
      max: [20, 'Password minimum length cannot exceed 20']
    },
    requireUppercase: {
      type: Boolean,
      default: true
    },
    requireNumbers: {
      type: Boolean,
      default: true
    },
    requireSpecialChars: {
      type: Boolean,
      default: false
    },
    sessionTimeoutMinutes: {
      type: Number,
      default: 30,
      min: [5, 'Session timeout must be at least 5 minutes'],
      max: [480, 'Session timeout cannot exceed 8 hours']
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: [3, 'Max login attempts must be at least 3'],
      max: [10, 'Max login attempts cannot exceed 10']
    }
  },
  backupSettings: {
    autoBackup: {
      type: Boolean,
      default: true
    },
    backupFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    retentionDays: {
      type: Number,
      default: 90,
      min: [7, 'Retention period must be at least 7 days']
    }
  },
  integrationSettings: {
    apiKeys: [{
      name: String,
      key: String,
      isActive: {
        type: Boolean,
        default: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    webhooks: [{
      name: String,
      url: String,
      events: [String],
      isActive: {
        type: Boolean,
        default: true
      }
    }]
  },
  customFields: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean', 'select'],
      required: true
    },
    options: [String], // For select type
    required: {
      type: Boolean,
      default: false
    },
    defaultValue: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
hospitalSettingsSchema.index({ hospitalId: 1 }, { unique: true });
hospitalSettingsSchema.index({ taxId: 1 }, { unique: true });

// Pre-save middleware to set default deduction types
hospitalSettingsSchema.pre('save', function(next) {
  if (this.isNew && (!this.taxSettings.deductionTypes || this.taxSettings.deductionTypes.length === 0)) {
    this.taxSettings.deductionTypes = [
      'Penyusutan Peralatan',
      'Biaya Operasional',
      'Biaya Penelitian',
      'Biaya CSR',
      'Biaya Pelatihan'
    ];
  }
  next();
});

export default mongoose.model('HospitalSettings', hospitalSettingsSchema);