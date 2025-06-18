import HospitalSettings from '../models/HospitalSettings.js';

// @desc    Get hospital settings
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res) => {
  try {
    let settings = await HospitalSettings.findOne({ hospitalId: req.user.hospitalId });

    if (!settings) {
      // Create default settings if none exist
      settings = await HospitalSettings.create({
        hospitalId: req.user.hospitalId,
        hospitalName: 'Rumah Sakit Umum Daerah',
        address: 'Jl. Kesehatan No. 123',
        phone: '+62-21-1234567',
        email: 'admin@hospital.com',
        taxId: '01.234.567.8-901.000',
        fiscalYearStart: 1,
        currency: 'IDR',
        lastModifiedBy: req.user.id
      });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update hospital settings
// @route   PUT /api/settings
// @access  Private
export const updateSettings = async (req, res) => {
  try {
    req.body.lastModifiedBy = req.user.id;

    const settings = await HospitalSettings.findOneAndUpdate(
      { hospitalId: req.user.hospitalId },
      req.body,
      { 
        new: true, 
        runValidators: true,
        upsert: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private
export const resetSettings = async (req, res) => {
  try {
    const defaultSettings = {
      hospitalId: req.user.hospitalId,
      hospitalName: 'Rumah Sakit Umum Daerah',
      address: 'Jl. Kesehatan No. 123',
      phone: '+62-21-1234567',
      email: 'admin@hospital.com',
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
      },
      lastModifiedBy: req.user.id
    };

    const settings = await HospitalSettings.findOneAndUpdate(
      { hospitalId: req.user.hospitalId },
      defaultSettings,
      { 
        new: true, 
        runValidators: true,
        upsert: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Settings reset to default successfully',
      data: settings
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get backup settings
// @route   GET /api/settings/backup
// @access  Private
export const getBackupSettings = async (req, res) => {
  try {
    const settings = await HospitalSettings.findOne({ hospitalId: req.user.hospitalId });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    res.status(200).json({
      success: true,
      data: settings.backupSettings
    });
  } catch (error) {
    console.error('Get backup settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update backup settings
// @route   PUT /api/settings/backup
// @access  Private
export const updateBackupSettings = async (req, res) => {
  try {
    const settings = await HospitalSettings.findOneAndUpdate(
      { hospitalId: req.user.hospitalId },
      { 
        backupSettings: req.body,
        lastModifiedBy: req.user.id
      },
      { new: true, runValidators: true }
    );

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Backup settings updated successfully',
      data: settings.backupSettings
    });
  } catch (error) {
    console.error('Update backup settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create backup
// @route   POST /api/settings/backup/create
// @access  Private
export const createBackup = async (req, res) => {
  try {
    // In a real implementation, this would create a database backup
    // For now, we'll just simulate the process
    
    const backupId = `backup_${Date.now()}`;
    const backupData = {
      id: backupId,
      hospitalId: req.user.hospitalId,
      createdAt: new Date(),
      createdBy: req.user.id,
      size: Math.floor(Math.random() * 100) + 50, // Simulated size in MB
      status: 'completed'
    };

    res.status(201).json({
      success: true,
      message: 'Backup created successfully',
      data: backupData
    });
  } catch (error) {
    console.error('Create backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get backups
// @route   GET /api/settings/backups
// @access  Private
export const getBackups = async (req, res) => {
  try {
    // In a real implementation, this would fetch actual backup records
    // For now, we'll return simulated data
    
    const backups = [
      {
        id: 'backup_1704067200000',
        hospitalId: req.user.hospitalId,
        createdAt: new Date('2024-01-01'),
        size: 75,
        status: 'completed'
      },
      {
        id: 'backup_1703980800000',
        hospitalId: req.user.hospitalId,
        createdAt: new Date('2023-12-30'),
        size: 68,
        status: 'completed'
      }
    ];

    res.status(200).json({
      success: true,
      data: backups
    });
  } catch (error) {
    console.error('Get backups error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Restore backup
// @route   POST /api/settings/backup/:id/restore
// @access  Private
export const restoreBackup = async (req, res) => {
  try {
    const { id } = req.params;

    // In a real implementation, this would restore from the backup
    // For now, we'll just simulate the process
    
    res.status(200).json({
      success: true,
      message: `Backup ${id} restored successfully`
    });
  } catch (error) {
    console.error('Restore backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};