import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors.js';

const prisma = new PrismaClient();

/**
 * Create a new custom field
 * @route POST /api/v1/custom-fields
 */
export const createCustomField = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { fieldName, fieldType } = req.body;

    // Check if field already exists for this user
    const existingField = await prisma.customField.findUnique({
      where: {
        userId_fieldName: {
          userId,
          fieldName,
        },
      },
    });

    if (existingField) {
      throw new AppError('A custom field with this name already exists', 400);
    }

    // Create the custom field
    const customField = await prisma.customField.create({
      data: {
        userId,
        fieldName,
        fieldType,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Custom field created successfully',
      data: { customField },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all custom fields for the authenticated user
 * @route GET /api/v1/custom-fields
 */
export const getUserCustomFields = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { includeInactive } = req.query;

    const whereClause = { userId };
    if (includeInactive !== 'true') {
      whereClause.isActive = true;
    }

    const customFields = await prisma.customField.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      status: 'success',
      results: customFields.length,
      data: { customFields },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single custom field by ID
 * @route GET /api/v1/custom-fields/:id
 */
export const getCustomFieldById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const customField = await prisma.customField.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!customField) {
      throw new AppError('Custom field not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { customField },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a custom field
 * @route PUT /api/v1/custom-fields/:id
 */
export const updateCustomField = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { fieldName, fieldType, isActive } = req.body;

    // Check if custom field exists and belongs to user
    const existingField = await prisma.customField.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingField) {
      throw new AppError('Custom field not found', 404);
    }

    // If fieldName is being updated, check for duplicates
    if (fieldName && fieldName !== existingField.fieldName) {
      const duplicateField = await prisma.customField.findUnique({
        where: {
          userId_fieldName: {
            userId,
            fieldName,
          },
        },
      });

      if (duplicateField) {
        throw new AppError('A custom field with this name already exists', 400);
      }
    }

    // Update the custom field
    const updatedField = await prisma.customField.update({
      where: { id },
      data: {
        ...(fieldName && { fieldName }),
        ...(fieldType && { fieldType }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Custom field updated successfully',
      data: { customField: updatedField },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a custom field (soft delete by setting isActive to false)
 * @route DELETE /api/v1/custom-fields/:id
 */
export const deleteCustomField = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { hardDelete } = req.query;

    // Check if custom field exists and belongs to user
    const existingField = await prisma.customField.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingField) {
      throw new AppError('Custom field not found', 404);
    }

    if (hardDelete === 'true') {
      // Hard delete - permanently remove the custom field
      await prisma.customField.delete({
        where: { id },
      });

      res.status(200).json({
        status: 'success',
        message: 'Custom field permanently deleted',
      });
    } else {
      // Soft delete - set isActive to false
      await prisma.customField.update({
        where: { id },
        data: { isActive: false },
      });

      res.status(200).json({
        status: 'success',
        message: 'Custom field deactivated successfully',
      });
    }
  } catch (error) {
    next(error);
  }
};
