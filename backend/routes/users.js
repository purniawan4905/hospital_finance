import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  toggleUserStatus,
  getUserActivity
} from '../controllers/userController.js';
import { protect, authorize, checkPermission } from '../middleware/auth.js';
import { validateUserRegistration, validateObjectId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(checkPermission('manage_users'));

// Get all users
router.get('/', validatePagination, getUsers);

// Get user activity
router.get('/:id/activity', validateObjectId, getUserActivity);

// Get single user
router.get('/:id', validateObjectId, getUser);

// Create new user
router.post('/', validateUserRegistration, createUser);

// Update user
router.put('/:id', validateObjectId, updateUser);

// Update user role
router.patch('/:id/role', validateObjectId, updateUserRole);

// Toggle user status (activate/deactivate)
router.patch('/:id/status', validateObjectId, toggleUserStatus);

// Delete user
router.delete('/:id', validateObjectId, deleteUser);

export default router;