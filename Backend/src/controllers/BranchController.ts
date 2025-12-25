import { Request, Response } from 'express';
import { z } from 'zod';
import { BranchType } from '@prisma/client';
import { BranchService } from '../services/BranchService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../middlewares/error.middleware';
import { logger } from '../config/logger';

// Validation schemas
const createBranchSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Branch name is required'),
    code: z.string().min(1, 'Branch code is required'),
    city: z.string().min(1, 'City is required'),
    district: z.string().min(1, 'District is required'),
    province: z.string().min(1, 'Province is required'),
    type: z.nativeEnum(BranchType),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
    description: z.string().optional(),
  }),
});

const updateBranchSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Branch name is required').optional(),
    code: z.string().min(1, 'Branch code is required').optional(),
    city: z.string().min(1, 'City is required').optional(),
    district: z.string().min(1, 'District is required').optional(),
    province: z.string().min(1, 'Province is required').optional(),
    type: z.nativeEnum(BranchType).optional(),
    status: z.boolean().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
    description: z.string().optional(),
  }),
});

const branchQuerySchema = z.object({
  query: z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    search: z.string().optional(),
    type: z.nativeEnum(BranchType).optional(),
    status: z.string().transform(val => val === 'true').optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

const branchParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid branch ID'),
  }),
});

export class BranchController {
  private branchService = new BranchService();

  createBranch = asyncHandler(async (req: Request, res: Response) => {
    const branchData = req.body;
    const userId = req.user?.userId;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    try {
      const result = await this.branchService.createBranch(
        branchData,
        userId,
        ipAddress,
        userAgent
      );

      ResponseHelper.created(res, result, 'Branch created successfully');
    } catch (error) {
      logger.error('Create branch error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to create branch');
    }
  });

  getBranchById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const result = await this.branchService.getBranchById(id);
      ResponseHelper.success(res, result, 'Branch retrieved successfully');
    } catch (error) {
      logger.error('Get branch error:', error);
      if (error instanceof Error && error.message === 'Branch not found') {
        ResponseHelper.notFound(res, 'Branch not found');
      } else {
        ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve branch');
      }
    }
  });

  getBranches = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query;

    try {
      const result = await this.branchService.getBranches(query);
      ResponseHelper.paginated(res, result.branches, result.pagination, 'Branches retrieved successfully');
    } catch (error) {
      logger.error('Get branches error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve branches');
    }
  });

  updateBranch = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user?.userId;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    try {
      const result = await this.branchService.updateBranch(
        id,
        updateData,
        userId,
        ipAddress,
        userAgent
      );

      ResponseHelper.success(res, result, 'Branch updated successfully');
    } catch (error) {
      logger.error('Update branch error:', error);
      if (error instanceof Error && error.message === 'Branch not found') {
        ResponseHelper.notFound(res, 'Branch not found');
      } else {
        ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to update branch');
      }
    }
  });

  deleteBranch = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    try {
      await this.branchService.deleteBranch(id, userId, ipAddress, userAgent);
      ResponseHelper.success(res, null, 'Branch deleted successfully');
    } catch (error) {
      logger.error('Delete branch error:', error);
      if (error instanceof Error && error.message === 'Branch not found') {
        ResponseHelper.notFound(res, 'Branch not found');
      } else {
        ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to delete branch');
      }
    }
  });

  getBranchStats = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await this.branchService.getBranchStats();
      ResponseHelper.success(res, result, 'Branch statistics retrieved successfully');
    } catch (error) {
      logger.error('Get branch stats error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve branch statistics');
    }
  });

  getActiveBranches = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await this.branchService.getActiveBranches();
      ResponseHelper.success(res, result, 'Active branches retrieved successfully');
    } catch (error) {
      logger.error('Get active branches error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve active branches');
    }
  });

  getBranchesByCity = asyncHandler(async (req: Request, res: Response) => {
    const { city } = req.query;

    if (!city || typeof city !== 'string') {
      ResponseHelper.badRequest(res, 'City parameter is required');
      return;
    }

    try {
      const result = await this.branchService.getBranchesByCity(city);
      ResponseHelper.success(res, result, 'Branches by city retrieved successfully');
    } catch (error) {
      logger.error('Get branches by city error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve branches by city');
    }
  });

  getBranchesByType = asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.query;

    if (!type || typeof type !== 'string') {
      ResponseHelper.badRequest(res, 'Type parameter is required');
      return;
    }

    if (!Object.values(BranchType).includes(type as BranchType)) {
      ResponseHelper.badRequest(res, 'Invalid branch type');
      return;
    }

    try {
      const result = await this.branchService.getBranchesByType(type as BranchType);
      ResponseHelper.success(res, result, 'Branches by type retrieved successfully');
    } catch (error) {
      logger.error('Get branches by type error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve branches by type');
    }
  });

  toggleBranchStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    try {
      const result = await this.branchService.toggleBranchStatus(
        id,
        userId,
        ipAddress,
        userAgent
      );

      ResponseHelper.success(res, result, 'Branch status updated successfully');
    } catch (error) {
      logger.error('Toggle branch status error:', error);
      if (error instanceof Error && error.message === 'Branch not found') {
        ResponseHelper.notFound(res, 'Branch not found');
      } else {
        ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to update branch status');
      }
    }
  });
}

// Export validation schemas
export {
  createBranchSchema,
  updateBranchSchema,
  branchQuerySchema,
  branchParamsSchema,
};
