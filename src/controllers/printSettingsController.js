import { PrismaClient } from '@prisma/client';
import { ValidationError } from '../utils/errors.js';

const prismaClient = new PrismaClient();

// Default settings configuration
const DEFAULT_SETTINGS = {
  visibleFields: [
    'itemNumber',
    'productDescription',
    'hsCode',
    'quantity',
    'uoM',
    'rate',
    'totalValues',
    'valueSalesExcludingST',
    'salesTaxApplicable'
  ],
  columnWidths: {
    itemNumber: 5,
    productDescription: 20,
    hsCode: 10,
    quantity: 8,
    uoM: 6,
    rate: 8,
    totalValues: 10,
    valueSalesExcludingST: 10,
    fixedNotifiedValueOrRetailPrice: 10,
    salesTaxApplicable: 10,
    salesTaxWithheldAtSource: 10,
    furtherTax: 8,
    fedPayable: 8,
    discount: 8,
    sroScheduleNo: 10,
    sroItemSerialNo: 10
  },
  fontSize: 'small',
  tableBorders: true,
  showItemNumbers: true
};

// Available fields configuration
const AVAILABLE_FIELDS = [
  {
    key: 'itemNumber',
    label: 'Item #',
    description: 'Item serial number',
    category: 'basic',
    defaultVisible: true,
    minWidth: 5,
    maxWidth: 10,
    required: false
  },
  {
    key: 'productDescription',
    label: 'Product Description',
    description: 'Description of the product',
    category: 'basic',
    defaultVisible: true,
    minWidth: 15,
    maxWidth: 40,
    required: true
  },
  {
    key: 'hsCode',
    label: 'HS Code',
    description: 'Harmonized System Code',
    category: 'basic',
    defaultVisible: true,
    minWidth: 8,
    maxWidth: 15,
    required: true
  },
  {
    key: 'quantity',
    label: 'Quantity',
    description: 'Quantity of items',
    category: 'basic',
    defaultVisible: true,
    minWidth: 6,
    maxWidth: 12,
    required: true
  },
  {
    key: 'uoM',
    label: 'UoM',
    description: 'Unit of Measurement',
    category: 'basic',
    defaultVisible: true,
    minWidth: 5,
    maxWidth: 10,
    required: true
  },
  {
    key: 'rate',
    label: 'Rate',
    description: 'Tax rate',
    category: 'basic',
    defaultVisible: true,
    minWidth: 6,
    maxWidth: 12,
    required: true
  },
  {
    key: 'totalValues',
    label: 'Total Value',
    description: 'Total value including tax',
    category: 'pricing',
    defaultVisible: true,
    minWidth: 8,
    maxWidth: 15,
    required: true
  },
  {
    key: 'valueSalesExcludingST',
    label: 'Value (Excl. ST)',
    description: 'Value excluding sales tax',
    category: 'pricing',
    defaultVisible: true,
    minWidth: 8,
    maxWidth: 15,
    required: true
  },
  {
    key: 'fixedNotifiedValueOrRetailPrice',
    label: 'Retail Price',
    description: 'Fixed notified value or retail price',
    category: 'pricing',
    defaultVisible: false,
    minWidth: 8,
    maxWidth: 15,
    required: false
  },
  {
    key: 'salesTaxApplicable',
    label: 'Sales Tax',
    description: 'Applicable sales tax',
    category: 'tax',
    defaultVisible: true,
    minWidth: 8,
    maxWidth: 15,
    required: true
  },
  {
    key: 'salesTaxWithheldAtSource',
    label: 'Tax Withheld',
    description: 'Sales tax withheld at source',
    category: 'tax',
    defaultVisible: false,
    minWidth: 8,
    maxWidth: 15,
    required: false
  },
  {
    key: 'furtherTax',
    label: 'Further Tax',
    description: 'Additional further tax',
    category: 'tax',
    defaultVisible: false,
    minWidth: 6,
    maxWidth: 12,
    required: false
  },
  {
    key: 'fedPayable',
    label: 'FED Payable',
    description: 'Federal Excise Duty payable',
    category: 'tax',
    defaultVisible: false,
    minWidth: 6,
    maxWidth: 12,
    required: false
  },
  {
    key: 'discount',
    label: 'Discount',
    description: 'Discount amount',
    category: 'pricing',
    defaultVisible: false,
    minWidth: 6,
    maxWidth: 12,
    required: false
  },
  {
    key: 'sroScheduleNo',
    label: 'SRO Schedule',
    description: 'SRO schedule number',
    category: 'compliance',
    defaultVisible: false,
    minWidth: 8,
    maxWidth: 15,
    required: false
  },
  {
    key: 'sroItemSerialNo',
    label: 'SRO Item Serial',
    description: 'SRO item serial number',
    category: 'compliance',
    defaultVisible: false,
    minWidth: 8,
    maxWidth: 15,
    required: false
  }
];

const FIELD_CATEGORIES = [
  { key: 'basic', label: 'Basic Information', order: 1 },
  { key: 'pricing', label: 'Pricing & Values', order: 2 },
  { key: 'tax', label: 'Tax Information', order: 3 },
  { key: 'compliance', label: 'Compliance & SRO', order: 4 },
  { key: 'custom', label: 'Custom Fields', order: 5 }
];

/**
 * Get user's print settings or return defaults if not exists
 * Auto-cleans inactive/deleted custom fields
 * @route GET /api/v1/invoice-print-settings
 */
export const getPrintSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    let printSettings = await prismaClient.invoicePrintSettings.findUnique({
      where: { userId }
    });

    if (!printSettings) {
      // Return null with defaultSettings
      return res.status(200).json({
        status: 'success',
        data: {
          printSettings: null,
          defaultSettings: DEFAULT_SETTINGS
        }
      });
    }

    // Auto-clean inactive/deleted custom fields
    // Get user's active custom fields
    const activeCustomFields = await prismaClient.customField.findMany({
      where: { userId, isActive: true },
      select: { id: true }
    });

    const activeCustomFieldKeys = activeCustomFields.map(cf => `customField_${cf.id}`);
    
    // Filter out inactive/deleted custom fields from visibleFields
    const cleanedVisibleFields = printSettings.visibleFields.filter(field => {
      if (typeof field === 'string' && field.startsWith('customField_')) {
        return activeCustomFieldKeys.includes(field);
      }
      return true; // Keep all regular fields
    });

    // Check if any fields were removed
    if (cleanedVisibleFields.length !== printSettings.visibleFields.length) {
      // Also clean up columnWidths
      const cleanedColumnWidths = {};
      for (const field of cleanedVisibleFields) {
        if (printSettings.columnWidths[field]) {
          cleanedColumnWidths[field] = printSettings.columnWidths[field];
        }
      }

      // Update settings in database
      printSettings = await prismaClient.invoicePrintSettings.update({
        where: { userId },
        data: {
          visibleFields: cleanedVisibleFields,
          columnWidths: cleanedColumnWidths
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        printSettings
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update print settings (upsert)
 * Supports custom fields with customField_ prefix
 * @route POST /api/v1/invoice-print-settings
 */
export const savePrintSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      visibleFields,
      columnWidths,
      fontSize,
      tableBorders,
      showItemNumbers
    } = req.body;

    // VALIDATION 1: Validate field name formats and extract custom field IDs
    const customFieldIds = [];
    const validRegularFieldKeys = AVAILABLE_FIELDS.map(f => f.key);
    const errors = [];

    for (const field of visibleFields) {
      if (typeof field === 'string' && field.startsWith('customField_')) {
        const customFieldId = field.replace('customField_', '');
        
        // Validate UUID format (simple check)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(customFieldId)) {
          errors.push({
            field: field,
            message: 'Invalid custom field ID format'
          });
        } else {
          customFieldIds.push(customFieldId);
        }
      } else {
        // Validate regular field
        if (!validRegularFieldKeys.includes(field)) {
          errors.push({
            field: field,
            message: 'Unknown field'
          });
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        status: 'fail',
        error: {
          statusCode: 400,
          errors: errors
        },
        message: `Validation failed: ${errors.length} field(s) are invalid`
      });
    }

    // VALIDATION 2: Verify custom fields exist, belong to user, and are active
    if (customFieldIds.length > 0) {
      const customFields = await prismaClient.customField.findMany({
        where: {
          id: { in: customFieldIds },
          userId: userId,
          isActive: true
        },
        select: { id: true }
      });

      const foundIds = customFields.map(cf => cf.id);
      const missingFields = [];

      // Identify which specific fields are missing/invalid
      for (const fieldId of customFieldIds) {
        if (!foundIds.includes(fieldId)) {
          missingFields.push({
            field: `customField_${fieldId}`,
            message: 'Custom field not found, inactive, or does not belong to your account'
          });
        }
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          status: 'fail',
          error: {
            statusCode: 400,
            errors: missingFields
          },
          message: `Validation failed: ${missingFields.length} custom field(s) are invalid`
        });
      }
    }

    // VALIDATION 3: Ensure all visible fields have widths
    for (const field of visibleFields) {
      if (!columnWidths[field]) {
        return res.status(400).json({
          status: 'fail',
          message: `Missing width for field: ${field}`
        });
      }

      if (columnWidths[field] < 1 || columnWidths[field] > 50) {
        return res.status(400).json({
          status: 'fail',
          message: `Width for ${field} must be between 1-50%`
        });
      }
    }

    // VALIDATION 4: Field count limits (min 1, max 20 total)
    if (visibleFields.length < 1) {
      return res.status(400).json({
        status: 'fail',
        message: 'At least 1 field must be visible'
      });
    }

    if (visibleFields.length > 20) {
      return res.status(400).json({
        status: 'fail',
        message: 'Maximum 20 fields allowed (including custom fields)'
      });
    }

    // VALIDATION 5: Calculate width warning (non-blocking)
    const totalWidth = Object.values(columnWidths).reduce((sum, w) => sum + w, 0);
    const warning = (totalWidth < 95 || totalWidth > 105) 
      ? `Total column width is ${totalWidth}%. Recommended: 100%`
      : null;

    // Upsert print settings
    const printSettings = await prismaClient.invoicePrintSettings.upsert({
      where: { userId },
      update: {
        visibleFields,
        columnWidths,
        fontSize,
        tableBorders,
        showItemNumbers
      },
      create: {
        userId,
        visibleFields,
        columnWidths,
        fontSize,
        tableBorders,
        showItemNumbers
      }
    });

    const response = {
      status: 'success',
      message: 'Print settings saved successfully',
      data: {
        printSettings
      }
    };

    if (warning) {
      response.warning = warning;
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete print settings (reset to defaults)
 * @route DELETE /api/v1/invoice-print-settings
 */
export const deletePrintSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const existing = await prismaClient.invoicePrintSettings.findUnique({
      where: { userId }
    });

    if (existing) {
      await prismaClient.invoicePrintSettings.delete({
        where: { userId }
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Print settings reset to defaults'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available fields configuration
 * Includes user's active custom fields
 * @route GET /api/v1/invoice-print-settings/available-fields
 */
export const getAvailableFields = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get user's active custom fields
    const customFields = await prismaClient.customField.findMany({
      where: {
        userId: userId,
        isActive: true
      },
      select: {
        id: true,
        fieldName: true,
        fieldType: true
      }
    });

    // Transform custom fields to match expected format
    const customFieldsFormatted = customFields.map(cf => ({
      key: `customField_${cf.id}`,
      id: cf.id,
      label: cf.fieldName,
      fieldName: cf.fieldName,
      fieldType: cf.fieldType,
      description: `Custom field: ${cf.fieldName}`,
      category: 'custom',
      defaultVisible: false,
      minWidth: 8,
      maxWidth: cf.fieldType === 'textarea' ? 30 : 20,
      required: false
    }));

    res.status(200).json({
      status: 'success',
      data: {
        fields: AVAILABLE_FIELDS,
        customFields: customFieldsFormatted,
        categories: FIELD_CATEGORIES
      }
    });
  } catch (error) {
    next(error);
  }
};
