import express from 'express';
import {
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  approveReport,
  submitReport,
  archiveReport,
  duplicateReport,
  getReportStats,
  exportReport
} from '../controllers/reportController.js';
import { protect, authorize, checkPermission } from '../middleware/auth.js';
import { validateFinancialReport, validateObjectId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get reports with filtering and pagination
router.get('/', validatePagination, getReports);

// Get report statistics
router.get('/stats', checkPermission('view_reports'), getReportStats);

// Export report
router.get('/:id/export', validateObjectId, checkPermission('export_data'), exportReport);

// Get single report
router.get('/:id', validateObjectId, checkPermission('view_reports'), getReport);

// Create new report
router.post('/', validateFinancialReport, checkPermission('create_reports'), createReport);

// Update report
router.put('/:id', validateObjectId, validateFinancialReport, checkPermission('edit_reports'), updateReport);

// Submit report for approval
router.patch('/:id/submit', validateObjectId, checkPermission('edit_reports'), submitReport);

// Approve report
router.patch('/:id/approve', validateObjectId, checkPermission('approve_reports'), approveReport);

// Archive report
router.patch('/:id/archive', validateObjectId, checkPermission('delete_reports'), archiveReport);

// Duplicate report
router.post('/:id/duplicate', validateObjectId, checkPermission('create_reports'), duplicateReport);

// Delete report
router.delete('/:id', validateObjectId, checkPermission('delete_reports'), deleteReport);

export default router;