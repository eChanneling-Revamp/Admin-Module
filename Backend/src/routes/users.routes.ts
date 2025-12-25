import { Router } from 'express';
import { UserController, 
  createUserSchema, 
  updateUserSchema, 
  userQuerySchema, 
  userParamsSchema 
} from '../controllers/UserController';
import { validate } from '../middlewares/validate.middleware';
import { authenticateToken, requireActiveUser } from '../middlewares/auth.middleware';
import { requirePermission, requireAdmin } from '../middlewares/role.middleware';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticateToken);
router.use(requireActiveUser);

// User management routes (Admin only)
router.post('/', 
  requireAdmin,
  requirePermission({ resource: 'user', action: 'create' }),
  validate(createUserSchema), 
  userController.createUser
);

router.get('/', 
  requirePermission({ resource: 'user', action: 'read', conditions: ['all'] }),
  validate(userQuerySchema), 
  userController.getUsers
);

router.get('/stats', 
  requirePermission({ resource: 'user', action: 'read' }),
  userController.getUserStats
);

router.get('/:id', 
  requirePermission({ resource: 'user', action: 'read' }),
  validate(userParamsSchema), 
  userController.getUserById
);

router.put('/:id', 
  requirePermission({ resource: 'user', action: 'update' }),
  validate({ ...updateUserSchema, ...userParamsSchema } as any), 
  userController.updateUser
);

router.patch('/:id/toggle-status', 
  requirePermission({ resource: 'user', action: 'update' }),
  validate(userParamsSchema), 
  userController.toggleUserStatus
);

router.delete('/:id', 
  requireAdmin,
  requirePermission({ resource: 'user', action: 'delete' }),
  validate(userParamsSchema), 
  userController.deleteUser
);

export default router;
