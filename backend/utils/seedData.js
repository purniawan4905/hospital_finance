import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import FinancialReport from '../models/FinancialReport.js';
import HospitalSettings from '../models/HospitalSettings.js';
import ReviewSchedule from '../models/ReviewSchedule.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  const users = [
    {
      name: 'Administrator',
      email: 'admin@hospital.com',
      password: 'password',
      role: 'admin',
      hospitalId: 'hospital-1',
      phone: '+62-21-1234567',
      department: 'Administration',
      isActive: true,
      emailVerified: true
    },
    {
      name: 'Finance Manager',
      email: 'finance@hospital.com',
      password: 'password',
      role: 'finance',
      hospitalId: 'hospital-1',
      phone: '+62-21-1234568',
      department: 'Finance',
      isActive: true,
      emailVerified: true
    },
    {
      name: 'Viewer User',
      email: 'viewer@hospital.com',
      password: 'password',
      role: 'viewer',
      hospitalId: 'hospital-1',
      phone: '+62-21-1234569',
      department: 'General',
      isActive: true,
      emailVerified: true
    }
  ];

  await User.deleteMany({});
  const createdUsers = await User.create(users);
  console.log('Users seeded successfully');
  return createdUsers;
};

const seedSettings = async () => {
  const settings = {
    hospitalId: 'hospital-1',
    hospitalName: 'RS Sebening Kasih',
    address: 'Jl. Kesehatan No. 123, Jakarta Pusat',
    phone: '+62-21-1234567',
    email: 'admin@rsusebeningkasih.com',
    taxId: '01.234.567.8-901.000',
    fiscalYearStart: 1,
    currency: 'IDR',
    taxSettings: {
      corporateTaxRate: 0.25,
      vatRate: 0.11,
      withholdingTaxRate: 0.02,
      deductionTypes: [
        'Penyusutan Peralatan',
        'Biaya Operasional',
        'Biaya Penelitian',
        'Biaya CSR',
        'Biaya Pelatihan'
      ]
    },
    reportingSettings: {
      autoApproval: false,
      requireDualApproval: true,
      archiveAfterMonths: 24,
      reminderDays: [7, 3, 1]
    },
    notificationSettings: {
      emailNotifications: true,
      reminderDays: [7, 3, 1],
      notifyRoles: ['admin', 'finance']
    },
    securitySettings: {
      passwordMinLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      sessionTimeoutMinutes: 30,
      maxLoginAttempts: 5
    },
    backupSettings: {
      autoBackup: true,
      backupFrequency: 'weekly',
      retentionDays: 90
    }
  };

  await HospitalSettings.deleteMany({});
  await HospitalSettings.create(settings);
  console.log('Settings seeded successfully');
};

const seedReports = async (users) => {
  const adminUser = users.find(u => u.role === 'admin');
  
  const reports = [
    {
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
        rate: 0.25,
        deductions: 500000000
      },
      status: 'approved',
      createdBy: adminUser._id,
      approvedBy: adminUser._id,
      approvedAt: new Date('2024-02-01')
    },
    {
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
        rate: 0.25,
        deductions: 525000000
      },
      status: 'approved',
      createdBy: adminUser._id,
      approvedBy: adminUser._id,
      approvedAt: new Date('2024-03-01')
    },
    {
      hospitalId: 'hospital-1',
      reportType: 'monthly',
      period: 'Maret 2024',
      year: 2024,
      month: 3,
      revenue: {
        patientCare: 2600000000,
        emergencyServices: 820000000,
        surgery: 1250000000,
        laboratory: 430000000,
        pharmacy: 620000000,
        other: 230000000
      },
      expenses: {
        salaries: 1820000000,
        medicalSupplies: 920000000,
        equipment: 310000000,
        utilities: 210000000,
        maintenance: 155000000,
        insurance: 102000000,
        other: 260000000
      },
      assets: {
        current: {
          cash: 550000000,
          accountsReceivable: 850000000,
          inventory: 420000000,
          other: 110000000
        },
        fixed: {
          buildings: 15000000000,
          equipment: 8100000000,
          vehicles: 510000000,
          other: 1020000000
        }
      },
      liabilities: {
        current: {
          accountsPayable: 620000000,
          shortTermDebt: 290000000,
          accruedExpenses: 210000000,
          other: 105000000
        },
        longTerm: {
          longTermDebt: 4900000000,
          other: 490000000
        }
      },
      equity: {
        capital: 10000000000,
        retainedEarnings: 5100000000,
        currentEarnings: 2173000000
      },
      tax: {
        rate: 0.25,
        deductions: 510000000
      },
      status: 'submitted',
      createdBy: adminUser._id
    }
  ];

  await FinancialReport.deleteMany({});
  const createdReports = await FinancialReport.create(reports);
  console.log('Reports seeded successfully');
  return createdReports;
};

const seedSchedules = async (users, reports) => {
  const adminUser = users.find(u => u.role === 'admin');
  const financeUser = users.find(u => u.role === 'finance');
  
  const schedules = [
    {
      reportId: reports[0]._id,
      hospitalId: 'hospital-1',
      scheduledDate: new Date('2024-04-15'),
      reviewType: 'monthly',
      assignedTo: financeUser._id,
      status: 'completed',
      priority: 'medium',
      notes: 'Monthly review for January 2024',
      completedAt: new Date('2024-04-14'),
      completedBy: financeUser._id,
      createdBy: adminUser._id
    },
    {
      reportId: reports[1]._id,
      hospitalId: 'hospital-1',
      scheduledDate: new Date('2024-05-15'),
      reviewType: 'monthly',
      assignedTo: financeUser._id,
      status: 'in-progress',
      priority: 'medium',
      notes: 'Monthly review for February 2024',
      createdBy: adminUser._id
    },
    {
      reportId: reports[2]._id,
      hospitalId: 'hospital-1',
      scheduledDate: new Date('2024-06-15'),
      reviewType: 'monthly',
      assignedTo: adminUser._id,
      status: 'pending',
      priority: 'high',
      notes: 'Monthly review for March 2024 - needs approval',
      createdBy: adminUser._id
    }
  ];

  await ReviewSchedule.deleteMany({});
  await ReviewSchedule.create(schedules);
  console.log('Schedules seeded successfully');
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Starting database seeding...');
    
    const users = await seedUsers();
    await seedSettings();
    const reports = await seedReports(users);
    await seedSchedules(users, reports);
    
    console.log('Database seeding completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin: admin@hospital.com / password');
    console.log('Finance: finance@hospital.com / password');
    console.log('Viewer: viewer@hospital.com / password');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;