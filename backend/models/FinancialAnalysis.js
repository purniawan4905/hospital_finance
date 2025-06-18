import mongoose from 'mongoose';

const financialAnalysisSchema = new mongoose.Schema({
  hospitalId: {
    type: String,
    required: [true, 'Hospital ID is required'],
    trim: true
  },
  analysisType: {
    type: String,
    enum: ['trend', 'ratio', 'comparative', 'forecast', 'performance'],
    required: [true, 'Analysis type is required']
  },
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  reportIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinancialReport'
  }],
  metrics: {
    revenueGrowth: {
      current: Number,
      previous: Number,
      growthRate: Number
    },
    profitability: {
      grossProfitMargin: Number,
      netProfitMargin: Number,
      operatingMargin: Number
    },
    liquidity: {
      currentRatio: Number,
      quickRatio: Number,
      cashRatio: Number
    },
    efficiency: {
      assetTurnover: Number,
      receivableTurnover: Number,
      inventoryTurnover: Number
    },
    leverage: {
      debtToEquity: Number,
      debtToAssets: Number,
      interestCoverage: Number
    }
  },
  insights: [{
    category: {
      type: String,
      enum: ['positive', 'negative', 'neutral', 'warning']
    },
    title: String,
    description: String,
    impact: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    recommendation: String
  }],
  trends: [{
    metric: String,
    direction: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable', 'volatile']
    },
    percentage: Number,
    significance: {
      type: String,
      enum: ['significant', 'moderate', 'minor']
    }
  }],
  forecasts: [{
    metric: String,
    currentValue: Number,
    projectedValue: Number,
    timeframe: String,
    confidence: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  benchmarks: [{
    metric: String,
    hospitalValue: Number,
    industryAverage: Number,
    percentile: Number,
    status: {
      type: String,
      enum: ['above', 'below', 'at']
    }
  }],
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating'
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
financialAnalysisSchema.index({ hospitalId: 1, createdAt: -1 });
financialAnalysisSchema.index({ generatedBy: 1 });
financialAnalysisSchema.index({ analysisType: 1 });
financialAnalysisSchema.index({ status: 1 });

export default mongoose.model('FinancialAnalysis', financialAnalysisSchema);