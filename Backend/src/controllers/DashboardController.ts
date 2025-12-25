import { Request, Response } from 'express';
import { z } from 'zod';
import { DashboardService } from '../services/DashboardService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../middlewares/error.middleware';
import { logger } from '../config/logger';

// Validation schemas
const analyticsQuerySchema = z.object({
  query: z.object({
    timeframe: z.enum(['day', 'week', 'month', 'year']).optional(),
  }),
});

export class DashboardController {
  private dashboardService = new DashboardService();

  getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await this.dashboardService.getDashboardStats();
      ResponseHelper.success(res, result, 'Dashboard statistics retrieved successfully');
    } catch (error) {
      logger.error('Get dashboard stats error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve dashboard statistics');
    }
  });

  getUserStats = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await this.dashboardService.getUserStats();
      ResponseHelper.success(res, result, 'User statistics retrieved successfully');
    } catch (error) {
      logger.error('Get user stats error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve user statistics');
    }
  });

  getBranchStats = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await this.dashboardService.getBranchStats();
      ResponseHelper.success(res, result, 'Branch statistics retrieved successfully');
    } catch (error) {
      logger.error('Get branch stats error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve branch statistics');
    }
  });

  getInvoiceStats = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await this.dashboardService.getInvoiceStats();
      ResponseHelper.success(res, result, 'Invoice statistics retrieved successfully');
    } catch (error) {
      logger.error('Get invoice stats error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve invoice statistics');
    }
  });

  getAuditStats = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await this.dashboardService.getAuditStats();
      ResponseHelper.success(res, result, 'Audit statistics retrieved successfully');
    } catch (error) {
      logger.error('Get audit stats error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve audit statistics');
    }
  });

  getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
    const { limit } = req.query;
    const limitNumber = limit ? parseInt(limit as string) : 10;

    try {
      const result = await this.dashboardService.getRecentActivity(limitNumber);
      ResponseHelper.success(res, result, 'Recent activity retrieved successfully');
    } catch (error) {
      logger.error('Get recent activity error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve recent activity');
    }
  });

  getSystemHealth = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await this.dashboardService.getSystemHealth();
      ResponseHelper.success(res, result, 'System health retrieved successfully');
    } catch (error) {
      logger.error('Get system health error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve system health');
    }
  });

  getAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { timeframe = 'month' } = req.query;

    try {
      const result = await this.dashboardService.getAnalytics(timeframe as 'day' | 'week' | 'month' | 'year');
      ResponseHelper.success(res, result, 'Analytics retrieved successfully');
    } catch (error) {
      logger.error('Get analytics error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve analytics');
    }
  });
}

// Export validation schemas
export { analyticsQuerySchema };
