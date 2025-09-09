import { body, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Food item validation rules
const validateFoodItem = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Food name must be between 1 and 100 characters'),
  body('category')
    .isIn([
      'fruits', 'vegetables', 'dairy', 'meat', 'poultry', 'seafood',
      'grains', 'nuts', 'legumes', 'beverages', 'snacks', 'condiments',
      'frozen', 'canned', 'bakery', 'other'
    ])
    .withMessage('Invalid category'),
  body('quantity.amount')
    .isFloat({ min: 0.1 })
    .withMessage('Quantity amount must be greater than 0'),
  body('quantity.unit')
    .isIn([
      'pieces', 'kg', 'g', 'lbs', 'oz', 'l', 'ml', 'cups',
      'tbsp', 'tsp', 'slices', 'cans', 'bottles', 'packages'
    ])
    .withMessage('Invalid quantity unit'),
  body('purchaseDate')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid date'),
  body('expiryDate')
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
  body('storageLocation')
    .optional()
    .isIn(['refrigerator', 'freezer', 'pantry', 'counter', 'other'])
    .withMessage('Invalid storage location'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot be more than 500 characters'),
  handleValidationErrors
];

export {
  validateUserRegistration,
  validateUserLogin,
  validateFoodItem,
  handleValidationErrors
};
