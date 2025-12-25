import { Request, Response } from 'express';
import { z } from 'zod';
import { DoctorStatus } from '@prisma/client';
import { DoctorService } from '../services/DoctorService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../middlewares/error.middleware';
import { logger } from '../config/logger';

// Validation schemas
const createDoctorSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    specialization: z.string().optional(),
    qualification: z.string().optional(),
    experience: z.number().min(0).optional(),
    phoneNumber: z.string().optional(),
    consultationFee: z.number().min(0).optional(),
    description: z.string().optional(),
    languages: z.array(z.string()).optional(),
    availableDays: z.array(z.string()).optional(),
  }),
});

const updateDoctorSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    specialization: z.string().optional(),
    qualification: z.string().optional(),
    experience: z.number().min(0).optional(),
    phoneNumber: z.string().optional(),
    consultationFee: z.number().min(0).optional(),
    rating: z.number().min(0).max(5).optional(),
    profileImage: z.string().url().optional(),
    description: z.string().optional(),
    languages: z.array(z.string()).optional(),
    availableDays: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    status: z.nativeEnum(DoctorStatus).optional(),
  }),
});

const doctorParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Doctor ID is required'),
  }),
});

export class DoctorController {
  private doctorService = new DoctorService();

  getAllDoctors = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('DoctorController: getAllDoctors called');
      const doctors = await this.doctorService.getAllDoctors();
      logger.info(`DoctorController: Returning ${doctors.length} doctors`);
      ResponseHelper.success(res, doctors, 'Doctors retrieved successfully');
    } catch (error) {
      logger.error('Get all doctors error:', error);
      ResponseHelper.badRequest(res, 'Failed to retrieve doctors');
    }
  });

  getDoctorById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const doctor = await this.doctorService.getDoctorById(id);
      
      if (!doctor) {
        ResponseHelper.notFound(res, 'Doctor not found');
        return;
      }

      ResponseHelper.success(res, doctor, 'Doctor retrieved successfully');
    } catch (error) {
      logger.error('Get doctor by ID error:', error);
      ResponseHelper.badRequest(res, 'Failed to retrieve doctor');
    }
  });

  createDoctor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const doctor = await this.doctorService.createDoctor(req.body);
      ResponseHelper.created(res, doctor, 'Doctor created successfully');
    } catch (error) {
      logger.error('Create doctor error:', error);
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        ResponseHelper.badRequest(res, 'Email already exists');
      } else {
        ResponseHelper.badRequest(res, 'Failed to create doctor');
      }
    }
  });

  updateDoctor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const doctor = await this.doctorService.updateDoctor(id, req.body);
      
      if (!doctor) {
        ResponseHelper.notFound(res, 'Doctor not found');
        return;
      }

      ResponseHelper.success(res, doctor, 'Doctor updated successfully');
    } catch (error) {
      logger.error('Update doctor error:', error);
      ResponseHelper.badRequest(res, 'Failed to update doctor');
    }
  });

  deleteDoctor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const success = await this.doctorService.deleteDoctor(id);
      
      if (!success) {
        ResponseHelper.notFound(res, 'Doctor not found');
        return;
      }

      ResponseHelper.success(res, null, 'Doctor deleted successfully');
    } catch (error) {
      logger.error('Delete doctor error:', error);
      ResponseHelper.badRequest(res, 'Failed to delete doctor');
    }
  });

  getDoctorStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.doctorService.getDoctorStats();
      ResponseHelper.success(res, stats, 'Doctor stats retrieved successfully');
    } catch (error) {
      logger.error('Get doctor stats error:', error);
      ResponseHelper.badRequest(res, 'Failed to retrieve doctor stats');
    }
  });
}

// Export validation schemas
export {
  createDoctorSchema,
  updateDoctorSchema,
  doctorParamsSchema,
};
