import { body } from 'express-validator';

export const createHsCodeValidation = [
  // Validate that either hsCode or hsCodes is provided, but not both
  body().custom((value, { req }) => {
    const hasSingle = req.body.hsCode !== undefined;
    const hasBulk = req.body.hsCodes !== undefined;
    
    if (!hasSingle && !hasBulk) {
      throw new Error('Either hsCode or hsCodes must be provided');
    }
    if (hasSingle && hasBulk) {
      throw new Error('Cannot provide both hsCode and hsCodes');
    }
    return true;
  }),

  // Single HS Code creation
  body('hsCode')
    .if((value, { req }) => !req.body.hsCodes)
    .trim()
    .notEmpty()
    .withMessage('HS Code is required'),

  body('description')
    .if((value, { req }) => !req.body.hsCodes)
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  // Bulk HS Codes creation
  body('hsCodes')
    .if((value, { req }) => req.body.hsCodes !== undefined)
    .isArray({ min: 1 })
    .withMessage('hsCodes must be an array with at least 1 item'),

  body('hsCodes.*.hsCode')
    .if((value, { req }) => req.body.hsCodes !== undefined)
    .trim()
    .notEmpty()
    .withMessage('HS Code is required'),

  body('hsCodes.*.description')
    .if((value, { req }) => req.body.hsCodes !== undefined)
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];

export const updateHsCodeValidation = [
  body('hsCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('HS Code cannot be empty'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];
