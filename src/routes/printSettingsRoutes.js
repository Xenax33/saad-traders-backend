import express from 'express';
import {
  getPrintSettings,
  savePrintSettings,
  deletePrintSettings,
  getAvailableFields
} from '../controllers/printSettingsController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { savePrintSettingsValidators } from '../validators/printSettingsValidators.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/invoice-print-settings - Get user's print settings
router.get('/', getPrintSettings);

// POST /api/v1/invoice-print-settings - Create or update print settings (upsert)
router.post(
  '/',
  savePrintSettingsValidators,
  validate,
  savePrintSettings
);

// DELETE /api/v1/invoice-print-settings - Reset to defaults
router.delete('/', deletePrintSettings);

// GET /api/v1/invoice-print-settings/available-fields - Get available fields metadata
router.get('/available-fields', getAvailableFields);

export default router;
