import express from 'express';
import {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  markCompleted,
  addComment,
  getUpcomingSchedules,
  getOverdueSchedules
} from '../controllers/scheduleController.js';
import { protect, checkPermission } from '../middleware/auth.js';
import { validateSchedule, validateObjectId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get upcoming schedules
router.get('/upcoming', checkPermission('view_reports'), getUpcomingSchedules);

// Get overdue schedules
router.get('/overdue', checkPermission('view_reports'), getOverdueSchedules);

// Get all schedules
router.get('/', validatePagination, checkPermission('view_reports'), getSchedules);

// Get single schedule
router.get('/:id', validateObjectId, checkPermission('view_reports'), getSchedule);

// Create new schedule
router.post('/', validateSchedule, checkPermission('create_reports'), createSchedule);

// Update schedule
router.put('/:id', validateObjectId, validateSchedule, checkPermission('edit_reports'), updateSchedule);

// Mark schedule as completed
router.patch('/:id/complete', validateObjectId, checkPermission('edit_reports'), markCompleted);

// Add comment to schedule
router.post('/:id/comment', validateObjectId, checkPermission('view_reports'), addComment);

// Delete schedule
router.delete('/:id', validateObjectId, checkPermission('delete_reports'), deleteSchedule);

export default router;