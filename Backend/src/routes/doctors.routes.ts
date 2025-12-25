import { Router } from 'express';
import { DoctorController, 
  createDoctorSchema, 
  updateDoctorSchema, 
  doctorParamsSchema 
} from '../controllers/DoctorController';
import { validate } from '../middlewares/validate.middleware';
import { authenticateToken, requireActiveUser } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/role.middleware';
import { z } from 'zod';

const router = Router();
const doctorController = new DoctorController();

// All routes require authentication
router.use(authenticateToken);
router.use(requireActiveUser);

// Doctor CRUD routes
router.post('/', 
  requirePermission({ resource: 'doctor', action: 'create' }),
  validate(createDoctorSchema), 
  doctorController.createDoctor
);

router.get('/', 
  requirePermission({ resource: 'doctor', action: 'read' }),
  doctorController.getAllDoctors
);

router.get('/stats', 
  requirePermission({ resource: 'doctor', action: 'read' }),
  doctorController.getDoctorStats
);

router.get('/:id', 
  requirePermission({ resource: 'doctor', action: 'read' }),
  validate(doctorParamsSchema), 
  doctorController.getDoctorById
);

router.put('/:id', 
  requirePermission({ resource: 'doctor', action: 'update' }),
  validate(z.object({
    body: updateDoctorSchema,
    params: doctorParamsSchema,
  })), 
  doctorController.updateDoctor
);

router.delete('/:id', 
  requirePermission({ resource: 'doctor', action: 'delete' }),
  validate(doctorParamsSchema), 
  doctorController.deleteDoctor
);

export default router;
