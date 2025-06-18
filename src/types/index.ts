export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'finance' | 'viewer';
  hospitalId: string;
  createdAt: Date;
}

export interface FinancialReport {
  _id: string;
  hospitalId: string;
  reportType: 'monthly' | 'quarterly' | 'annual';
  period: string;
  year: number;
  month?: number;
  quarter?: number;
  revenue: {
    patientCare: number;
    emergencyServices: number;
    surgery: number;
    laboratory: number;
    pharmacy: number;
    other: number;
  };
  expenses: {
    salaries: number;
    medicalSupplies: number;
    equipment: number;
    utilities: number;
    maintenance: number;
    insurance: number;
    other: number;
  };
  assets: {
    current: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      other: number;
    };
    fixed: {
      buildings: number;
      equipment: number;
      vehicles: number;
      other: number;
    };
  };
  liabilities: {
    current: {
      accountsPayable: number;
      shortTermDebt: number;
      accruedExpenses: number;
      other: number;
    };
    longTerm: {
      longTermDebt: number;
      other: number;
    };
  };
  equity: {
    capital: number;
    retainedEarnings: number;
    currentEarnings: number;
  };
  tax: {
    income: number;
    rate: number;
    amount: number;
    deductions: number;
    netTaxable: number;
  };
  balanceSheet: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    isBalanced: boolean;
  };
  status: 'draft' | 'submitted' | 'approved' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
}

export interface ReviewSchedule {
  _id: string;
  reportId: string;
  scheduledDate: Date;
  reviewType: 'monthly' | 'quarterly' | 'annual' | 'audit';
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HospitalSettings {
  _id: string;
  hospitalId: string;
  hospitalName: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  fiscalYearStart: number; // month (1-12)
  currency: string;
  taxSettings: {
    corporateTaxRate: number;
    vatRate: number;
    withholdingTaxRate: number;
    deductionTypes: string[];
  };
  reportingSettings: {
    autoApproval: boolean;
    requireDualApproval: boolean;
    archiveAfterMonths: number;
  };
  notificationSettings: {
    emailNotifications: boolean;
    reminderDays: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  taxAmount: number;
  revenueGrowth: number;
  profitMargin: number;
  currentRatio: number;
  debtToEquityRatio: number;
}