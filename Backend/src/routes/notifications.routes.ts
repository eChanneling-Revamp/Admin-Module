import { Router } from 'express';
import { NotificationController, 
  sendNotificationSchema, 
  sendBulkEmailSchema, 
  sendCustomEmailSchema 
} from '../controllers/NotificationController';
import { validate } from '../middlewares/validate.middleware';
import { authenticateToken, requireActiveUser } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/role.middleware';

const router = Router();
const notificationController = new NotificationController();

// All routes require authentication
router.use(authenticateToken);
router.use(requireActiveUser);

// Notification routes
router.get('/', 
  requirePermission({ resource: 'notification', action: 'read' }),
  notificationController.getUserNotifications
);

router.post('/send', 
  requirePermission({ resource: 'notification', action: 'create' }),
  validate(sendNotificationSchema), 
  notificationController.sendNotification
);

router.post('/bulk-email', 
  requirePermission({ resource: 'notification', action: 'create' }),
  validate(sendBulkEmailSchema), 
  notificationController.sendBulkEmail
);

router.post('/custom-email', 
  requirePermission({ resource: 'notification', action: 'create' }),
  validate(sendCustomEmailSchema), 
  notificationController.sendCustomEmail
);

router.post('/welcome-email', 
  requirePermission({ resource: 'notification', action: 'create' }),
  notificationController.sendWelcomeEmail
);

router.post('/password-reset-email', 
  requirePermission({ resource: 'notification', action: 'create' }),
  notificationController.sendPasswordResetEmail
);

export default router;
