import express from 'express';
import {
  postInvoice,
  postProductionInvoice,
  validateInvoice,
  getUserInvoices,
  getInvoiceById,
  deleteInvoice,
} from '../controllers/invoiceController.js';
import {
  postInvoiceValidation,
  postProductionInvoiceValidation,
  validateInvoiceValidation,
} from '../validators/invoiceValidators.js';
import { validate } from '../middleware/validator.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Invoice routes
router.post('/', postInvoiceValidation, validate, postInvoice);
router.post('/production', postProductionInvoiceValidation, validate, postProductionInvoice);
router.post('/validate', validateInvoiceValidation, validate, validateInvoice);
router.get('/', getUserInvoices);
router.get('/:id', getInvoiceById);
router.delete('/:id', deleteInvoice);

export default router;
