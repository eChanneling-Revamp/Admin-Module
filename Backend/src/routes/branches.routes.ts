import { Router } from 'express';
import { BranchController, 
  createBranchSchema, 
  updateBranchSchema, 
  branchQuerySchema, 
  branchParamsSchema 
} from '../controllers/BranchController';
import { validate } from '../middlewares/validate.middleware';
import { authenticateToken, requireActiveUser } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/role.middleware';

const router = Router();
const branchController = new BranchController();

// All routes require authentication
router.use(authenticateToken);
router.use(requireActiveUser);

// Branch CRUD routes
router.post('/', 
  requirePermission({ resource: 'branch', action: 'create' }),
  validate(createBranchSchema), 
  branchController.createBranch
);

router.get('/', 
  requirePermission({ resource: 'branch', action: 'read' }),
  validate(branchQuerySchema), 
  branchController.getBranches
);

router.get('/stats', 
  requirePermission({ resource: 'branch', action: 'read' }),
  branchController.getBranchStats
);

router.get('/active', 
  requirePermission({ resource: 'branch', action: 'read' }),
  branchController.getActiveBranches
);

router.get('/by-city', 
  requirePermission({ resource: 'branch', action: 'read' }),
  branchController.getBranchesByCity
);

router.get('/by-type', 
  requirePermission({ resource: 'branch', action: 'read' }),
  branchController.getBranchesByType
);

router.get('/:id', 
  requirePermission({ resource: 'branch', action: 'read' }),
  validate(branchParamsSchema), 
  branchController.getBranchById
);

router.put('/:id', 
  requirePermission({ resource: 'branch', action: 'update' }),
  validate({ ...updateBranchSchema, ...branchParamsSchema } as any), 
  branchController.updateBranch
);

router.patch('/:id/toggle-status', 
  requirePermission({ resource: 'branch', action: 'update' }),
  validate(branchParamsSchema), 
  branchController.toggleBranchStatus
);

router.delete('/:id', 
  requirePermission({ resource: 'branch', action: 'delete' }),
  validate(branchParamsSchema), 
  branchController.deleteBranch
);

export default router;
