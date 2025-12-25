import { Router } from 'express';
import { InvoiceController, 
  createInvoiceSchema, 
  updateInvoiceSchema, 
  paymentSchema,
  invoiceQuerySchema, 
  invoiceParamsSchema 
} from '../controllers/InvoiceController';
import { validate } from '../middlewares/validate.middleware';
import { authenticateToken, requireActiveUser } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/role.middleware';

const router = Router();
const invoiceController = new InvoiceController();

// All routes require authentication
router.use(authenticateToken);
router.use(requireActiveUser);

// Invoice CRUD routes
router.post('/', 
  requirePermission({ resource: 'invoice', action: 'create' }),
  validate(createInvoiceSchema), 
  invoiceController.createInvoice
);

router.get('/', 
  requirePermission({ resource: 'invoice', action: 'read' }),
  validate(invoiceQuerySchema), 
  invoiceController.getInvoices
);

router.get('/stats', 
  requirePermission({ resource: 'invoice', action: 'read' }),
  invoiceController.getInvoiceStats
);

router.get('/overdue', 
  requirePermission({ resource: 'invoice', action: 'read' }),
  invoiceController.getOverdueInvoices
);

router.get('/by-branch', 
  requirePermission({ resource: 'invoice', action: 'read' }),
  invoiceController.getInvoicesByBranch
);

router.get('/:id', 
  requirePermission({ resource: 'invoice', action: 'read' }),
  validate(invoiceParamsSchema), 
  invoiceController.getInvoiceById
);

router.put('/:id', 
  requirePermission({ resource: 'invoice', action: 'update' }),
  validate({ ...updateInvoiceSchema, ...invoiceParamsSchema } as any), 
  invoiceController.updateInvoice
);

router.post('/process-payment', 
  requirePermission({ resource: 'invoice', action: 'update', conditions: ['pay'] }),
  validate(paymentSchema), 
  invoiceController.processPayment
);

router.post('/:id/send-notification', 
  requirePermission({ resource: 'invoice', action: 'update' }),
  validate(invoiceParamsSchema), 
  invoiceController.sendInvoiceNotification
);

router.post('/mark-overdue', 
  requirePermission({ resource: 'invoice', action: 'update' }),
  invoiceController.markOverdueInvoices
);

router.delete('/:id', 
  requirePermission({ resource: 'invoice', action: 'delete' }),
  validate(invoiceParamsSchema), 
  invoiceController.deleteInvoice
);

export default router;
