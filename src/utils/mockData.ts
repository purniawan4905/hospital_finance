import { FinancialReport, DashboardStats } from '../types';

export const mockReports: FinancialReport[] = [
  {
    _id: '1',
    hospitalId: 'hospital-1',
    reportType: 'monthly',
    period: 'Januari 2024',
    year: 2024,
    month: 1,
    revenue: {
      patientCare: 2500000000,
      emergencyServices: 800000000,
      surgery: 1200000000,
      laboratory: 400000000,
      pharmacy: 600000000,
      other: 200000000
    },
    expenses: {
      salaries: 1800000000,
      medicalSupplies: 900000000,
      equipment: 300000000,
      utilities: 200000000,
      maintenance: 150000000,
      insurance: 100000000,
      other: 250000000
    },
    assets: {
      current: {
        cash: 500000000,
        accountsReceivable: 800000000,
        inventory: 400000000,
        other: 100000000
      },
      fixed: {
        buildings: 15000000000,
        equipment: 8000000000,
        vehicles: 500000000,
        other: 1000000000
      }
    },
    liabilities: {
      current: {
        accountsPayable: 600000000,
        shortTermDebt: 300000000,
        accruedExpenses: 200000000,
        other: 100000000
      },
      longTerm: {
        longTermDebt: 5000000000,
        other: 500000000
      }
    },
    equity: {
      capital: 10000000000,
      retainedEarnings: 5000000000,
      currentEarnings: 2000000000
    },
    tax: {
      income: 2000000000,
      rate: 0.25,
      amount: 500000000,
      deductions: 500000000,
      netTaxable: 1500000000
    },
    balanceSheet: {
      totalAssets: 25400000000,
      totalLiabilities: 6700000000,
      totalEquity: 17000000000,
      isBalanced: true
    },
    status: 'approved',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    createdBy: '1'
  },
  {
    _id: '2',
    hospitalId: 'hospital-1',
    reportType: 'monthly',
    period: 'Februari 2024',
    year: 2024,
    month: 2,
    revenue: {
      patientCare: 2700000000,
      emergencyServices: 850000000,
      surgery: 1300000000,
      laboratory: 450000000,
      pharmacy: 650000000,
      other: 250000000
    },
    expenses: {
      salaries: 1850000000,
      medicalSupplies: 950000000,
      equipment: 320000000,
      utilities: 220000000,
      maintenance: 160000000,
      insurance: 105000000,
      other: 270000000
    },
    assets: {
      current: {
        cash: 600000000,
        accountsReceivable: 900000000,
        inventory: 450000000,
        other: 120000000
      },
      fixed: {
        buildings: 15000000000,
        equipment: 8200000000,
        vehicles: 520000000,
        other: 1050000000
      }
    },
    liabilities: {
      current: {
        accountsPayable: 650000000,
        shortTermDebt: 280000000,
        accruedExpenses: 220000000,
        other: 110000000
      },
      longTerm: {
        longTermDebt: 4800000000,
        other: 480000000
      }
    },
    equity: {
      capital: 10000000000,
      retainedEarnings: 5200000000,
      currentEarnings: 2325000000
    },
    tax: {
      income: 2325000000,
      rate: 0.25,
      amount: 581250000,
      deductions: 525000000,
      netTaxable: 1800000000
    },
    balanceSheet: {
      totalAssets: 26840000000,
      totalLiabilities: 6540000000,
      totalEquity: 17525000000,
      isBalanced: true
    },
    status: 'approved',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
    createdBy: '1'
  }
];

export const calculateDashboardStats = (reports: FinancialReport[]): DashboardStats => {
  if (reports.length === 0) {
    return {
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
    };
  }

  const latestReport = reports[reports.length - 1];
  const previousReport = reports.length > 1 ? reports[reports.length - 2] : null;

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

  let revenueGrowth = 0;
  if (previousReport) {
    const previousRevenue = Object.values(previousReport.revenue).reduce((a, b) => a + b, 0);
    revenueGrowth = ((totalRevenue - previousRevenue) / previousRevenue) * 100;
  }

  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const currentRatio = totalCurrentLiabilities > 0 ? totalCurrentAssets / totalCurrentLiabilities : 0;
  const debtToEquityRatio = totalEquity > 0 ? totalLiabilities / totalEquity : 0;

  return {
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
  };
};