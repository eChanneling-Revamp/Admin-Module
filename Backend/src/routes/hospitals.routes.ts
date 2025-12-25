import { Router } from 'express';
import { HospitalController, 
  createHospitalSchema, 
  updateHospitalSchema, 
  hospitalParamsSchema,
  hospitalQuerySchema 
} from '../controllers/HospitalController';
import { validate } from '../middlewares/validate.middleware';
import { authenticateToken, requireActiveUser } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/role.middleware';
import { z } from 'zod';

const router = Router();
const hospitalController = new HospitalController();

// All routes require authentication
router.use(authenticateToken);
router.use(requireActiveUser);

// Hospital CRUD routes
router.post('/', 
  requirePermission({ resource: 'hospital', action: 'create' }),
  validate(createHospitalSchema), 
  hospitalController.createHospital
);

router.get('/', 
  requirePermission({ resource: 'hospital', action: 'read' }),
  hospitalController.getAllHospitals
);

router.get('/stats', 
  requirePermission({ resource: 'hospital', action: 'read' }),
  hospitalController.getHospitalStats
);

router.get('/by-city', 
  requirePermission({ resource: 'hospital', action: 'read' }),
  validate(hospitalQuerySchema), 
  hospitalController.getHospitalsByCity
);

router.get('/:id', 
  requirePermission({ resource: 'hospital', action: 'read' }),
  validate(hospitalParamsSchema), 
  hospitalController.getHospitalById
);

router.put('/:id', 
  requirePermission({ resource: 'hospital', action: 'update' }),
  validate(z.object({
    body: updateHospitalSchema,
    params: hospitalParamsSchema,
  })), 
  hospitalController.updateHospital
);

router.delete('/:id', 
  requirePermission({ resource: 'hospital', action: 'delete' }),
  validate(hospitalParamsSchema), 
  hospitalController.deleteHospital
);

export default router;
