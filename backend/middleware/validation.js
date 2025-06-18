import { body, param, query, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['admin', 'finance', 'viewer'])
    .withMessage('Role must be admin, finance, or viewer'),
  body('hospitalId')
    .trim()
    .notEmpty()
    .withMessage('Hospital ID is required'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Financial report validation rules
export const validateFinancialReport = [
  body('reportType')
    .isIn(['monthly', 'quarterly', 'annual'])
    .withMessage('Report type must be monthly, quarterly, or annual'),
  body('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  body('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('quarter')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Quarter must be between 1 and 4'),
  body('revenue.patientCare')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Patient care revenue must be non-negative'),
  body('revenue.emergencyServices')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Emergency services revenue must be non-negative'),
  body('revenue.surgery')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Surgery revenue must be non-negative'),
  body('revenue.laboratory')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Laboratory revenue must be non-negative'),
  body('revenue.pharmacy')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Pharmacy revenue must be non-negative'),
  body('revenue.other')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Other revenue must be non-negative'),
  handleValidationErrors
];

// Settings validation rules
export const validateHospitalSettings = [
  body('hospitalName')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Hospital name must be between 2 and 200 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('taxId')
    .trim()
    .notEmpty()
    .withMessage('Tax ID is required'),
  body('fiscalYearStart')
    .isInt({ min: 1, max: 12 })
    .withMessage('Fiscal year start must be between 1 and 12'),
  body('taxSettings.corporateTaxRate')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Corporate tax rate must be between 0 and 1'),
  body('taxSettings.vatRate')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('VAT rate must be between 0 and 1'),
  handleValidationErrors
];

// Schedule validation rules
export const validateSchedule = [
  body('reportId')
    .isMongoId()
    .withMessage('Valid report ID is required'),
  body('scheduledDate')
    .isISO8601()
    .withMessage('Valid scheduled date is required'),
  body('reviewType')
    .isIn(['monthly', 'quarterly', 'annual', 'audit', 'special'])
    .withMessage('Invalid review type'),
  body('assignedTo')
    .isMongoId()
    .withMessage('Valid assigned user ID is required'),
  handleValidationErrors
];

// Parameter validation
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Query validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];