import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import {
  createCustomField,
  getUserCustomFields,
  getCustomFieldById,
  updateCustomField,
  deleteCustomField,
} from '../controllers/customFieldController.js';
import {
  createCustomFieldValidation,
  updateCustomFieldValidation,
  getCustomFieldByIdValidation,
  deleteCustomFieldValidation,
  getUserCustomFieldsValidation,
} from '../validators/customFieldValidators.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Custom field routes
router.post('/', createCustomFieldValidation, validate, createCustomField);
router.get('/', getUserCustomFieldsValidation, validate, getUserCustomFields);
router.get('/:id', getCustomFieldByIdValidation, validate, getCustomFieldById);
router.put('/:id', updateCustomFieldValidation, validate, updateCustomField);
router.delete('/:id', deleteCustomFieldValidation, validate, deleteCustomField);

export default router;
