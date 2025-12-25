import { Request, Response } from 'express';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { UserRepository } from '../repositories/UserRepository';
import { AuditService } from '../services/AuditService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../middlewares/error.middleware';
import { logger } from '../config/logger';

// Validation schemas
const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().optional(),
    role: z.nativeEnum(UserRole).optional(),
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    role: z.nativeEnum(UserRole).optional(),
    isActive: z.boolean().optional(),
  }),
});

const userQuerySchema = z.object({
  query: z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    search: z.string().optional(),
    role: z.nativeEnum(UserRole).optional(),
    isActive: z.string().transform(val => val === 'true').optional(),
    sortBy: z.enum(['email', 'name', 'createdAt', 'lastLoginAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

const userParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
});

export class UserController {
  private userRepository = new UserRepository();
  private auditService = new AuditService();

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const userData = req.body;
    const currentUserId = req.user?.userId;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        ResponseHelper.conflict(res, 'User already exists with this email');
        return;
      }

      const result = await this.userRepository.create(userData);

      // Log audit
      if (currentUserId) {
        await this.auditService.log({
          userId: currentUserId,
          action: 'USER_CREATE',
          resource: 'user',
          resourceId: result.id,
          description: `Created user: ${result.email}`,
          metadata: {
            userEmail: result.email,
            userRole: result.role,
          },
          ipAddress,
          userAgent,
        });
      }

      ResponseHelper.created(res, {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        isActive: result.isActive,
        lastLoginAt: result.lastLoginAt,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      }, 'User created successfully');
    } catch (error) {
      logger.error('Create user error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to create user');
    }
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        ResponseHelper.notFound(res, 'User not found');
        return;
      }

      ResponseHelper.success(res, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }, 'User retrieved successfully');
    } catch (error) {
      logger.error('Get user error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve user');
    }
  });

  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query;

    try {
      const result = await this.userRepository.findMany(query);
      ResponseHelper.paginated(res, result.users, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      }, 'Users retrieved successfully');
    } catch (error) {
      logger.error('Get users error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve users');
    }
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    const currentUserId = req.user?.userId;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    try {
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        ResponseHelper.notFound(res, 'User not found');
        return;
      }

      const result = await this.userRepository.update(id, updateData);

      // Log audit
      if (currentUserId) {
        await this.auditService.log({
          userId: currentUserId,
          action: 'USER_UPDATE',
          resource: 'user',
          resourceId: result.id,
          description: `Updated user: ${result.email}`,
          metadata: {
            userEmail: result.email,
            changes: updateData,
          },
          ipAddress,
          userAgent,
        });
      }

      ResponseHelper.success(res, {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        isActive: result.isActive,
        lastLoginAt: result.lastLoginAt,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      }, 'User updated successfully');
    } catch (error) {
      logger.error('Update user error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to update user');
    }
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentUserId = req.user?.userId;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    try {
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        ResponseHelper.notFound(res, 'User not found');
        return;
      }

      // Prevent self-deletion
      if (currentUserId === id) {
        ResponseHelper.badRequest(res, 'Cannot delete your own account');
        return;
      }

      await this.userRepository.delete(id);

      // Log audit
      if (currentUserId) {
        await this.auditService.log({
          userId: currentUserId,
          action: 'USER_DELETE',
          resource: 'user',
          resourceId: id,
          description: `Deleted user: ${existingUser.email}`,
          metadata: {
            userEmail: existingUser.email,
            userRole: existingUser.role,
          },
          ipAddress,
          userAgent,
        });
      }

      ResponseHelper.success(res, null, 'User deleted successfully');
    } catch (error) {
      logger.error('Delete user error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to delete user');
    }
  });

  getUserStats = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await this.userRepository.getStats();
      ResponseHelper.success(res, result, 'User statistics retrieved successfully');
    } catch (error) {
      logger.error('Get user stats error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve user statistics');
    }
  });

  toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentUserId = req.user?.userId;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    try {
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        ResponseHelper.notFound(res, 'User not found');
        return;
      }

      // Prevent self-deactivation
      if (currentUserId === id) {
        ResponseHelper.badRequest(res, 'Cannot deactivate your own account');
        return;
      }

      const result = await this.userRepository.update(id, {
        isActive: !existingUser.isActive,
      });

      // Log audit
      if (currentUserId) {
        await this.auditService.log({
          userId: currentUserId,
          action: 'USER_UPDATE',
          resource: 'user',
          resourceId: result.id,
          description: `${result.isActive ? 'Activated' : 'Deactivated'} user: ${result.email}`,
          metadata: {
            userEmail: result.email,
            newStatus: result.isActive,
          },
          ipAddress,
          userAgent,
        });
      }

      ResponseHelper.success(res, {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        isActive: result.isActive,
        lastLoginAt: result.lastLoginAt,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      }, 'User status updated successfully');
    } catch (error) {
      logger.error('Toggle user status error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to update user status');
    }
  });
}

// Export validation schemas
export {
  createUserSchema,
  updateUserSchema,
  userQuerySchema,
  userParamsSchema,
};
