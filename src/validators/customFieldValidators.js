import { body, param, query } from 'express-validator';

export const createCustomFieldValidation = [
  body('fieldName')
    .trim()
    .notEmpty()
    .withMessage('Field name is required')
    .isString()
    .withMessage('Field name must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('Field name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_\s]+$/)
    .withMessage('Field name can only contain letters, numbers, underscores, and spaces'),

  body('fieldType')
    .trim()
    .notEmpty()
    .withMessage('Field type is required')
    .isIn(['text', 'number', 'date', 'textarea'])
    .withMessage('Field type must be one of: text, number, date, textarea'),
];

export const updateCustomFieldValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Custom field ID is required')
    .isUUID()
    .withMessage('Custom field ID must be a valid UUID'),

  body('fieldName')
    .optional()
    .trim()
    .isString()
    .withMessage('Field name must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('Field name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_\s]+$/)
    .withMessage('Field name can only contain letters, numbers, underscores, and spaces'),

  body('fieldType')
    .optional()
    .trim()
    .isIn(['text', 'number', 'date', 'textarea'])
    .withMessage('Field type must be one of: text, number, date, textarea'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const getCustomFieldByIdValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Custom field ID is required')
    .isUUID()
    .withMessage('Custom field ID must be a valid UUID'),
];

export const deleteCustomFieldValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Custom field ID is required')
    .isUUID()
    .withMessage('Custom field ID must be a valid UUID'),

  query('hardDelete')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('hardDelete must be either "true" or "false"'),
];

export const getUserCustomFieldsValidation = [
  query('includeInactive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('includeInactive must be either "true" or "false"'),
];
