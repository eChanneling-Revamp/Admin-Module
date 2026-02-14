import { Router } from 'express';
import { HospitalController, 
  createHospitalSchema, 
  updateHospitalSchema, 
  updateHospitalRequestSchema,
  hospitalParamsSchema,
  hospitalQuerySchema,
  updateHospitalStatusSchema,
  updateHospitalFacilitiesSchema
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

router.get('/groups', 
  requirePermission({ resource: 'hospital', action: 'read' }),
  hospitalController.getHospitalGroups
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
  validate(updateHospitalRequestSchema), 
  hospitalController.updateHospital
);

router.delete('/:id', 
  requirePermission({ resource: 'hospital', action: 'delete' }),
  validate(hospitalParamsSchema), 
  hospitalController.deleteHospital
);

router.patch('/:id/status',
  requirePermission({ resource: 'hospital', action: 'update' }),
  validate(updateHospitalStatusSchema),
  hospitalController.updateHospitalStatus
);

router.patch('/:id/facilities',
  requirePermission({ resource: 'hospital', action: 'update' }),
  validate(updateHospitalFacilitiesSchema),
  hospitalController.updateHospitalFacilities
);

export default router;
