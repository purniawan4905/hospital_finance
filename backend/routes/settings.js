import express from 'express';
import {
  getSettings,
  updateSettings,
  resetSettings,
  getBackupSettings,
  updateBackupSettings,
  createBackup,
  getBackups,
  restoreBackup
} from '../controllers/settingsController.js';
import { protect, checkPermission } from '../middleware/auth.js';
import { validateHospitalSettings } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);
router.use(checkPermission('manage_settings'));

// Get hospital settings
router.get('/', getSettings);

// Update hospital settings
router.put('/', validateHospitalSettings, updateSettings);

// Reset settings to default
router.post('/reset', resetSettings);

// Backup routes
router.get('/backup', getBackupSettings);
router.put('/backup', updateBackupSettings);
router.post('/backup/create', createBackup);
router.get('/backups', getBackups);
router.post('/backup/:id/restore', restoreBackup);

export default router;