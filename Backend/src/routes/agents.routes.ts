import { Router } from 'express';
import { AgentController, 
  createAgentSchema, 
  updateAgentSchema, 
  agentQuerySchema, 
  agentParamsSchema 
} from '../controllers/AgentController';
import { validate } from '../middlewares/validate.middleware';
import { authenticateToken, requireActiveUser } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();
const agentController = new AgentController();

// All routes require authentication
router.use(authenticateToken);
router.use(requireActiveUser);

// Agent management routes
router.post('/', 
  requireRole(UserRole.ADMIN),
  validate(createAgentSchema), 
  agentController.createAgent
);

router.get('/', 
  requireRole(UserRole.ADMIN, UserRole.SUPERVISOR),
  validate(agentQuerySchema), 
  agentController.getAllAgents
);

router.get('/stats', 
  requireRole(UserRole.ADMIN, UserRole.SUPERVISOR),
  agentController.getAgentStats
);

router.get('/:id', 
  requireRole(UserRole.ADMIN, UserRole.SUPERVISOR),
  validate(agentParamsSchema), 
  agentController.getAgentById
);

router.put('/:id', 
  requireRole(UserRole.ADMIN),
  validate({ ...updateAgentSchema, ...agentParamsSchema } as any), 
  agentController.updateAgent
);

router.delete('/:id', 
  requireRole(UserRole.ADMIN),
  validate(agentParamsSchema), 
  agentController.deleteAgent
);

export default router;
