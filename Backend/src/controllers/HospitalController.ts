import { Request, Response } from 'express';
import { z } from 'zod';
import { HospitalStatus } from '@prisma/client';
import { HospitalService } from '../services/HospitalService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../middlewares/error.middleware';
import { logger } from '../config/logger';

// Validation schemas
const createHospitalSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    address: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    contactNumber: z.string().optional(),
    website: z.string().url().optional(),
    facilities: z.array(z.string()).optional(),
    profileImage: z.string().url().optional(),
  }),
});

const updateHospitalSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    contactNumber: z.string().optional(),
    website: z.string().url().optional(),
    facilities: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    status: z.nativeEnum(HospitalStatus).optional(),
    profileImage: z.string().url().optional(),
  }),
});

const hospitalParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Hospital ID is required'),
  }),
});

const hospitalQuerySchema = z.object({
  query: z.object({
    city: z.string().optional(),
    district: z.string().optional(),
  }),
});

export class HospitalController {
  private hospitalService = new HospitalService();

  getAllHospitals = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('HospitalController: getAllHospitals called');
      const hospitals = await this.hospitalService.getAllHospitals();
      logger.info(`HospitalController: Returning ${hospitals.length} hospitals`);
      ResponseHelper.success(res, hospitals, 'Hospitals retrieved successfully');
    } catch (error) {
      logger.error('Get all hospitals error:', error);
      ResponseHelper.badRequest(res, 'Failed to retrieve hospitals');
    }
  });

  getHospitalById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const hospital = await this.hospitalService.getHospitalById(id);
      
      if (!hospital) {
        ResponseHelper.notFound(res, 'Hospital not found');
        return;
      }

      ResponseHelper.success(res, hospital, 'Hospital retrieved successfully');
    } catch (error) {
      logger.error('Get hospital by ID error:', error);
      ResponseHelper.badRequest(res, 'Failed to retrieve hospital');
    }
  });

  createHospital = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const hospital = await this.hospitalService.createHospital(req.body);
      ResponseHelper.created(res, hospital, 'Hospital created successfully');
    } catch (error) {
      logger.error('Create hospital error:', error);
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        ResponseHelper.badRequest(res, 'Email already exists');
      } else {
        ResponseHelper.badRequest(res, 'Failed to create hospital');
      }
    }
  });

  updateHospital = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const hospital = await this.hospitalService.updateHospital(id, req.body);
      
      if (!hospital) {
        ResponseHelper.notFound(res, 'Hospital not found');
        return;
      }

      ResponseHelper.success(res, hospital, 'Hospital updated successfully');
    } catch (error) {
      logger.error('Update hospital error:', error);
      ResponseHelper.badRequest(res, 'Failed to update hospital');
    }
  });

  deleteHospital = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const success = await this.hospitalService.deleteHospital(id);
      
      if (!success) {
        ResponseHelper.notFound(res, 'Hospital not found');
        return;
      }

      ResponseHelper.success(res, null, 'Hospital deleted successfully');
    } catch (error) {
      logger.error('Delete hospital error:', error);
      ResponseHelper.badRequest(res, 'Failed to delete hospital');
    }
  });

  getHospitalStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.hospitalService.getHospitalStats();
      ResponseHelper.success(res, stats, 'Hospital stats retrieved successfully');
    } catch (error) {
      logger.error('Get hospital stats error:', error);
      ResponseHelper.badRequest(res, 'Failed to retrieve hospital stats');
    }
  });

  getHospitalsByCity = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { city } = req.query;

    try {
      const hospitals = await this.hospitalService.getHospitalsByCity(city as string);
      ResponseHelper.success(res, hospitals, 'Hospitals by city retrieved successfully');
    } catch (error) {
      logger.error('Get hospitals by city error:', error);
      ResponseHelper.badRequest(res, 'Failed to retrieve hospitals by city');
    }
  });
}

// Export validation schemas
export {
  createHospitalSchema,
  updateHospitalSchema,
  hospitalParamsSchema,
  hospitalQuerySchema,
};
