import { body } from 'express-validator';

export const createBuyerValidation = [
  body('ntncnic')
    .trim()
    .notEmpty()
    .withMessage('NTN/CNIC is required'),

  body('businessName')
    .trim()
    .notEmpty()
    .withMessage('Business name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Business name must be between 2 and 255 characters'),

  body('province')
    .trim()
    .notEmpty()
    .withMessage('Province is required'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 5 })
    .withMessage('Address must be at least 5 characters long'),

  body('registrationType')
    .trim()
    .notEmpty()
    .withMessage('Registration type is required')
    .isIn(['Registered', 'Unregistered'])
    .withMessage('Registration type must be either Registered or Unregistered'),
];

export const updateBuyerValidation = [
  body('ntncnic')
    .optional()
    .trim(),

  body('businessName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Business name must be between 2 and 255 characters'),

  body('province')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Province cannot be empty'),

  body('address')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Address must be at least 5 characters long'),

  body('registrationType')
    .optional()
    .trim()
    .isIn(['Registered', 'Unregistered'])
    .withMessage('Registration type must be either Registered or Unregistered'),
];
