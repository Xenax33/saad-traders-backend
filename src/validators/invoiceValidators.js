import { body } from 'express-validator';

export const postInvoiceValidation = [
  body('invoiceType')
    .trim()
    .notEmpty()
    .withMessage('Invoice type is required')
    .isString()
    .withMessage('Invoice type must be a string'),

  body('invoiceDate')
    .notEmpty()
    .withMessage('Invoice date is required')
    .isISO8601()
    .withMessage('Invoice date must be in yyyy-MM-dd format'),

  body('buyerId')
    .trim()
    .notEmpty()
    .withMessage('Buyer ID is required')
    .isUUID()
    .withMessage('Buyer ID must be a valid UUID'),

  body('scenarioId')
    .trim()
    .notEmpty()
    .withMessage('Scenario ID is required')
    .isUUID()
    .withMessage('Scenario ID must be a valid UUID'),

  body('invoiceRefNo')
    .optional()
    .trim(),

  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one invoice item is required'),

  body('items.*.hsCodeId')
    .trim()
    .notEmpty()
    .withMessage('HS Code ID is required for each item')
    .isUUID()
    .withMessage('HS Code ID must be a valid UUID'),

  body('items.*.productDescription')
    .trim()
    .notEmpty()
    .withMessage('Product description is required for each item'),

  body('items.*.rate')
    .trim()
    .notEmpty()
    .withMessage('Rate is required for each item'),

  body('items.*.uoM')
    .trim()
    .notEmpty()
    .withMessage('Unit of measurement is required for each item'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),

  body('items.*.totalValues')
    .notEmpty()
    .withMessage('Total values is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Total values must be a positive number'),

  body('items.*.valueSalesExcludingST')
    .notEmpty()
    .withMessage('Value excluding sales tax is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Value excluding sales tax must be a positive number'),

  body('items.*.fixedNotifiedValueOrRetailPrice')
    .notEmpty()
    .withMessage('Fixed notified value or retail price is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Fixed notified value or retail price must be a positive number'),

  body('items.*.salesTaxApplicable')
    .notEmpty()
    .withMessage('Sales tax applicable is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Sales tax applicable must be a positive number'),

  body('items.*.salesTaxWithheldAtSource')
    .notEmpty()
    .withMessage('Sales tax withheld at source is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Sales tax withheld at source must be a positive number'),

  body('items.*.extraTax')
    .optional()
    .trim(),

  body('items.*.furtherTax')
    .notEmpty()
    .withMessage('Further tax is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Further tax must be a positive number'),

  body('items.*.sroScheduleNo')
    .optional()
    .trim(),

  body('items.*.fedPayable')
    .notEmpty()
    .withMessage('FED payable is required for each item')
    .isFloat({ min: 0 })
    .withMessage('FED payable must be a positive number'),

  body('items.*.discount')
    .notEmpty()
    .withMessage('Discount is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Discount must be a positive number'),

  body('items.*.sroItemSerialNo')
    .optional()
    .trim(),

  // Custom fields validation for each item (optional)
  body('items.*.customFields')
    .optional()
    .isArray()
    .withMessage('Custom fields must be an array'),

  body('items.*.customFields.*.customFieldId')
    .if(body('items.*.customFields').exists())
    .trim()
    .notEmpty()
    .withMessage('Custom field ID is required')
    .isUUID()
    .withMessage('Custom field ID must be a valid UUID'),

  body('items.*.customFields.*.value')
    .if(body('items.*.customFields').exists())
    .notEmpty()
    .withMessage('Custom field value is required'),
];

export const postProductionInvoiceValidation = [
  body('invoiceType')
    .trim()
    .notEmpty()
    .withMessage('Invoice type is required')
    .isString()
    .withMessage('Invoice type must be a string'),

  body('invoiceDate')
    .notEmpty()
    .withMessage('Invoice date is required')
    .isISO8601()
    .withMessage('Invoice date must be in yyyy-MM-dd format'),

  body('buyerId')
    .trim()
    .notEmpty()
    .withMessage('Buyer ID is required')
    .isUUID()
    .withMessage('Buyer ID must be a valid UUID'),

  body('invoiceRefNo')
    .optional()
    .trim(),

  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one invoice item is required'),

  body('items.*.hsCodeId')
    .trim()
    .notEmpty()
    .withMessage('HS Code ID is required for each item')
    .isUUID()
    .withMessage('HS Code ID must be a valid UUID'),

  body('items.*.productDescription')
    .trim()
    .notEmpty()
    .withMessage('Product description is required for each item'),

  body('items.*.rate')
    .trim()
    .notEmpty()
    .withMessage('Rate is required for each item'),

  body('items.*.uoM')
    .trim()
    .notEmpty()
    .withMessage('Unit of measurement is required for each item'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),

  body('items.*.totalValues')
    .notEmpty()
    .withMessage('Total values is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Total values must be a positive number'),

  body('items.*.valueSalesExcludingST')
    .notEmpty()
    .withMessage('Value excluding sales tax is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Value excluding sales tax must be a positive number'),

  body('items.*.fixedNotifiedValueOrRetailPrice')
    .notEmpty()
    .withMessage('Fixed notified value or retail price is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Fixed notified value or retail price must be a positive number'),

  body('items.*.salesTaxApplicable')
    .notEmpty()
    .withMessage('Sales tax applicable is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Sales tax applicable must be a positive number'),

  body('items.*.salesTaxWithheldAtSource')
    .notEmpty()
    .withMessage('Sales tax withheld at source is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Sales tax withheld at source must be a positive number'),

  body('items.*.extraTax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Extra tax must be a number'),

  body('items.*.furtherTax')
    .notEmpty()
    .withMessage('Further tax is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Further tax must be a positive number'),

  body('items.*.sroScheduleNo')
    .optional()
    .trim(),

  body('items.*.fedPayable')
    .notEmpty()
    .withMessage('FED payable is required for each item')
    .isFloat({ min: 0 })
    .withMessage('FED payable must be a positive number'),

  body('items.*.discount')
    .notEmpty()
    .withMessage('Discount is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Discount must be a positive number'),

  body('items.*.saleType')
    .trim()
    .notEmpty()
    .withMessage('Sale type is required for each item'),

  body('items.*.sroItemSerialNo')
    .optional()
    .trim(),

  // Custom fields validation for each item (optional)
  body('items.*.customFields')
    .optional()
    .isArray()
    .withMessage('Custom fields must be an array'),

  body('items.*.customFields.*.customFieldId')
    .if(body('items.*.customFields').exists())
    .trim()
    .notEmpty()
    .withMessage('Custom field ID is required')
    .isUUID()
    .withMessage('Custom field ID must be a valid UUID'),

  body('items.*.customFields.*.value')
    .if(body('items.*.customFields').exists())
    .notEmpty()
    .withMessage('Custom field value is required'),
];

export const validateInvoiceValidation = [
  body('invoiceNumber')
    .trim()
    .notEmpty()
    .withMessage('Invoice number is required')
    .isString()
    .withMessage('Invoice number must be a string'),
];
