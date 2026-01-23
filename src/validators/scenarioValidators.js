import { body } from 'express-validator';

export const createGlobalScenarioValidation = [
  body('scenarioCode')
    .trim()
    .notEmpty()
    .withMessage('Scenario code is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Scenario code must be between 1 and 50 characters'),
  body('scenarioDescription')
    .trim()
    .notEmpty()
    .withMessage('Scenario description is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Scenario description must be between 3 and 500 characters'),
];

export const updateGlobalScenarioValidation = [
  body('scenarioCode')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Scenario code must be between 1 and 50 characters'),
  body('scenarioDescription')
    .optional()
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Scenario description must be between 3 and 500 characters'),
  body('salesType')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Sales type must be between 1 and 255 characters'),
];

export const assignScenarioValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  body('scenarioId')
    .notEmpty()
    .withMessage('Scenario ID is required')
    .isUUID()
    .withMessage('Scenario ID must be a valid UUID'),
];

export const unassignScenarioValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  body('scenarioId')
    .notEmpty()
    .withMessage('Scenario ID is required')
    .isUUID()
    .withMessage('Scenario ID must be a valid UUID'),
];
