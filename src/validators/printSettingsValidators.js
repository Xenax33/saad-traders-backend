import { body } from 'express-validator';

const VALID_FIELD_KEYS = [
  'itemNumber',
  'productDescription',
  'hsCode',
  'quantity',
  'uoM',
  'rate',
  'totalValues',
  'valueSalesExcludingST',
  'fixedNotifiedValueOrRetailPrice',
  'salesTaxApplicable',
  'salesTaxWithheldAtSource',
  'furtherTax',
  'fedPayable',
  'discount',
  'sroScheduleNo',
  'sroItemSerialNo'
];

const VALID_FONT_SIZES = ['small', 'medium', 'large'];

export const savePrintSettingsValidators = [
  body('visibleFields')
    .isArray({ min: 1, max: 20 })
    .withMessage('visibleFields must be an array with 1-20 fields (including custom fields)'),
  
  body('visibleFields.*')
    .isString()
    .withMessage('Each visible field must be a string')
    .custom((value) => {
      // Allow regular fields or custom fields with customField_ prefix
      if (value.startsWith('customField_')) {
        return true; // Custom field validation happens in controller
      }
      return VALID_FIELD_KEYS.includes(value);
    })
    .withMessage('Invalid field name'),
  
  body('columnWidths')
    .isObject()
    .withMessage('columnWidths must be an object'),
  
  body('columnWidths.*')
    .isFloat({ min: 1, max: 50 })
    .withMessage('Column width must be a number between 1 and 50'),
  
  body('fontSize')
    .isString()
    .withMessage('fontSize must be a string')
    .isIn(VALID_FONT_SIZES)
    .withMessage('fontSize must be "small", "medium", or "large"'),
  
  body('tableBorders')
    .isBoolean()
    .withMessage('tableBorders must be a boolean'),
  
  body('showItemNumbers')
    .isBoolean()
    .withMessage('showItemNumbers must be a boolean')
];
