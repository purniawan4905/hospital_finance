import express from 'express';
import {
  getDashboardStats,
  getRevenueChart,
  getExpenseChart,
  getProfitChart,
  getBalanceSheetChart,
  getRecentActivity,
  getFinancialRatios,
  getComparativeAnalysis
} from '../controllers/dashboardController.js';
import { protect, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);
router.use(checkPermission('view_reports'));

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Get chart data
router.get('/charts/revenue', getRevenueChart);
router.get('/charts/expenses', getExpenseChart);
router.get('/charts/profit', getProfitChart);
router.get('/charts/balance-sheet', getBalanceSheetChart);

// Get financial ratios
router.get('/ratios', getFinancialRatios);

// Get comparative analysis
router.get('/analysis', getComparativeAnalysis);

// Get recent activity
router.get('/activity', getRecentActivity);

export default router;