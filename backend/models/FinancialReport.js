import mongoose from 'mongoose';

const financialReportSchema = new mongoose.Schema({
  hospitalId: {
    type: String,
    required: [true, 'Hospital ID is required'],
    trim: true
  },
  reportType: {
    type: String,
    enum: ['monthly', 'quarterly', 'annual'],
    required: [true, 'Report type is required']
  },
  period: {
    type: String,
    required: [true, 'Period is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2020, 'Year must be 2020 or later'],
    max: [2030, 'Year must be 2030 or earlier']
  },
  month: {
    type: Number,
    min: 1,
    max: 12,
    required: function() {
      return this.reportType === 'monthly';
    }
  },
  quarter: {
    type: Number,
    min: 1,
    max: 4,
    required: function() {
      return this.reportType === 'quarterly';
    }
  },
  revenue: {
    patientCare: {
      type: Number,
      default: 0,
      min: [0, 'Revenue cannot be negative']
    },
    emergencyServices: {
      type: Number,
      default: 0,
      min: [0, 'Revenue cannot be negative']
    },
    surgery: {
      type: Number,
      default: 0,
      min: [0, 'Revenue cannot be negative']
    },
    laboratory: {
      type: Number,
      default: 0,
      min: [0, 'Revenue cannot be negative']
    },
    pharmacy: {
      type: Number,
      default: 0,
      min: [0, 'Revenue cannot be negative']
    },
    other: {
      type: Number,
      default: 0,
      min: [0, 'Revenue cannot be negative']
    }
  },
  expenses: {
    salaries: {
      type: Number,
      default: 0,
      min: [0, 'Expenses cannot be negative']
    },
    medicalSupplies: {
      type: Number,
      default: 0,
      min: [0, 'Expenses cannot be negative']
    },
    equipment: {
      type: Number,
      default: 0,
      min: [0, 'Expenses cannot be negative']
    },
    utilities: {
      type: Number,
      default: 0,
      min: [0, 'Expenses cannot be negative']
    },
    maintenance: {
      type: Number,
      default: 0,
      min: [0, 'Expenses cannot be negative']
    },
    insurance: {
      type: Number,
      default: 0,
      min: [0, 'Expenses cannot be negative']
    },
    other: {
      type: Number,
      default: 0,
      min: [0, 'Expenses cannot be negative']
    }
  },
  assets: {
    current: {
      cash: {
        type: Number,
        default: 0,
        min: [0, 'Assets cannot be negative']
      },
      accountsReceivable: {
        type: Number,
        default: 0,
        min: [0, 'Assets cannot be negative']
      },
      inventory: {
        type: Number,
        default: 0,
        min: [0, 'Assets cannot be negative']
      },
      other: {
        type: Number,
        default: 0,
        min: [0, 'Assets cannot be negative']
      }
    },
    fixed: {
      buildings: {
        type: Number,
        default: 0,
        min: [0, 'Assets cannot be negative']
      },
      equipment: {
        type: Number,
        default: 0,
        min: [0, 'Assets cannot be negative']
      },
      vehicles: {
        type: Number,
        default: 0,
        min: [0, 'Assets cannot be negative']
      },
      other: {
        type: Number,
        default: 0,
        min: [0, 'Assets cannot be negative']
      }
    }
  },
  liabilities: {
    current: {
      accountsPayable: {
        type: Number,
        default: 0,
        min: [0, 'Liabilities cannot be negative']
      },
      shortTermDebt: {
        type: Number,
        default: 0,
        min: [0, 'Liabilities cannot be negative']
      },
      accruedExpenses: {
        type: Number,
        default: 0,
        min: [0, 'Liabilities cannot be negative']
      },
      other: {
        type: Number,
        default: 0,
        min: [0, 'Liabilities cannot be negative']
      }
    },
    longTerm: {
      longTermDebt: {
        type: Number,
        default: 0,
        min: [0, 'Liabilities cannot be negative']
      },
      other: {
        type: Number,
        default: 0,
        min: [0, 'Liabilities cannot be negative']
      }
    }
  },
  equity: {
    capital: {
      type: Number,
      default: 0
    },
    retainedEarnings: {
      type: Number,
      default: 0
    },
    currentEarnings: {
      type: Number,
      default: 0
    }
  },
  tax: {
    income: {
      type: Number,
      default: 0
    },
    rate: {
      type: Number,
      default: 0.25,
      min: [0, 'Tax rate cannot be negative'],
      max: [1, 'Tax rate cannot exceed 100%']
    },
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative']
    },
    deductions: {
      type: Number,
      default: 0,
      min: [0, 'Tax deductions cannot be negative']
    },
    netTaxable: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'archived'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  version: {
    type: Number,
    default: 1
  },
  previousVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinancialReport'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
financialReportSchema.index({ hospitalId: 1, year: -1, month: -1 });
financialReportSchema.index({ reportType: 1, status: 1 });
financialReportSchema.index({ createdBy: 1 });
financialReportSchema.index({ period: 1 });

// Ensure unique reports per period
financialReportSchema.index(
  { hospitalId: 1, reportType: 1, year: 1, month: 1, quarter: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: { $ne: 'archived' } }
  }
);

// Virtual for total revenue
financialReportSchema.virtual('totalRevenue').get(function() {
  return Object.values(this.revenue).reduce((sum, value) => sum + value, 0);
});

// Virtual for total expenses
financialReportSchema.virtual('totalExpenses').get(function() {
  return Object.values(this.expenses).reduce((sum, value) => sum + value, 0);
});

// Virtual for net profit
financialReportSchema.virtual('netProfit').get(function() {
  return this.totalRevenue - this.totalExpenses;
});

// Virtual for total assets
financialReportSchema.virtual('totalAssets').get(function() {
  const currentAssets = Object.values(this.assets.current).reduce((sum, value) => sum + value, 0);
  const fixedAssets = Object.values(this.assets.fixed).reduce((sum, value) => sum + value, 0);
  return currentAssets + fixedAssets;
});

// Virtual for total liabilities
financialReportSchema.virtual('totalLiabilities').get(function() {
  const currentLiabilities = Object.values(this.liabilities.current).reduce((sum, value) => sum + value, 0);
  const longTermLiabilities = Object.values(this.liabilities.longTerm).reduce((sum, value) => sum + value, 0);
  return currentLiabilities + longTermLiabilities;
});

// Virtual for total equity
financialReportSchema.virtual('totalEquity').get(function() {
  return this.equity.capital + this.equity.retainedEarnings + this.equity.currentEarnings;
});

// Pre-save middleware to calculate tax and equity
financialReportSchema.pre('save', function(next) {
  // Calculate tax
  const grossProfit = this.totalRevenue - this.totalExpenses;
  this.tax.income = grossProfit;
  this.tax.netTaxable = Math.max(0, grossProfit - this.tax.deductions);
  this.tax.amount = this.tax.netTaxable * this.tax.rate;
  
  // Calculate current earnings
  this.equity.currentEarnings = grossProfit - this.tax.amount;
  
  next();
});

// Ensure virtuals are included in JSON
financialReportSchema.set('toJSON', { virtuals: true });
financialReportSchema.set('toObject', { virtuals: true });

export default mongoose.model('FinancialReport', financialReportSchema);