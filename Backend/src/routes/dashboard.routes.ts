import { Router } from 'express';
import { DashboardController, analyticsQuerySchema } from '../controllers/DashboardController';
import { validate } from '../middlewares/validate.middleware';
import { authenticateToken, requireActiveUser } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/role.middleware';

const router = Router();
const dashboardController = new DashboardController();

// All routes require authentication
router.use(authenticateToken);
router.use(requireActiveUser);

// Dashboard routes
router.get('/stats', 
  requirePermission({ resource: 'dashboard', action: 'read' }),
  dashboardController.getDashboardStats
);

router.get('/users/stats', 
  requirePermission({ resource: 'dashboard', action: 'read' }),
  dashboardController.getUserStats
);

router.get('/branches/stats', 
  requirePermission({ resource: 'dashboard', action: 'read' }),
  dashboardController.getBranchStats
);

router.get('/invoices/stats', 
  requirePermission({ resource: 'dashboard', action: 'read' }),
  dashboardController.getInvoiceStats
);

router.get('/audit/stats', 
  requirePermission({ resource: 'dashboard', action: 'read' }),
  dashboardController.getAuditStats
);

router.get('/recent-activity', 
  requirePermission({ resource: 'dashboard', action: 'read' }),
  dashboardController.getRecentActivity
);

router.get('/system-health', 
  requirePermission({ resource: 'dashboard', action: 'read' }),
  dashboardController.getSystemHealth
);

router.get('/analytics', 
  requirePermission({ resource: 'dashboard', action: 'read', conditions: ['stats'] }),
  validate(analyticsQuerySchema), 
  dashboardController.getAnalytics
);

export default router;
