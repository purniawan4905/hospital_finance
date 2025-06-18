import express from 'express';
import {
  createReviewSchedule,
  getReviewSchedules,
  updateScheduleStatus,
  archiveOldReports,
  generateFinancialAnalysis,
  getFinancialAnalyses,
  getArchiveLogs
} from '../controllers/quickActionsController.js';
import { protect, checkPermission } from '../middleware/auth.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Review Schedule routes
router.post('/schedule-review', [
  body('reportId').isMongoId().withMessage('Valid report ID is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('reviewType').isIn(['monthly', 'quarterly', 'annual', 'audit', 'special']).withMessage('Invalid review type'),
  body('assignedTo').isMongoId().withMessage('Valid assigned user ID is required'),
  handleValidationErrors
], checkPermission('create_reports'), createReviewSchedule);

router.get('/schedules', checkPermission('view_reports'), getReviewSchedules);

router.patch('/schedule/:id/status', [
  body('status').isIn(['pending', 'in-progress', 'completed', 'overdue', 'cancelled']).withMessage('Invalid status'),
  handleValidationErrors
], checkPermission('edit_reports'), updateScheduleStatus);

// Archive routes
router.post('/archive-reports', [
  body('monthsOld').optional().isInt({ min: 1, max: 120 }).withMessage('Months old must be between 1 and 120'),
  body('archiveReason').optional().isLength({ max: 500 }).withMessage('Archive reason cannot exceed 500 characters'),
  handleValidationErrors
], checkPermission('delete_reports'), archiveOldReports);

router.get('/archive-logs', checkPermission('view_reports'), getArchiveLogs);

// Financial Analysis routes
router.post('/financial-analysis', [
  body('analysisType').optional().isIn(['trend', 'ratio', 'comparative', 'forecast', 'performance']).withMessage('Invalid analysis type'),
  body('months').optional().isInt({ min: 3, max: 60 }).withMessage('Months must be between 3 and 60'),
  handleValidationErrors
], checkPermission('view_reports'), generateFinancialAnalysis);

router.get('/analyses', checkPermission('view_reports'), getFinancialAnalyses);

export default router;