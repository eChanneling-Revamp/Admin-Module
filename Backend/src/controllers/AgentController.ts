import { Request, Response } from 'express';
import { z } from 'zod';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../middlewares/error.middleware';
import { logger } from '../config/logger';
import { prisma } from '../config/database';

// Type assertion for Agent model since Prisma client generation has permission issues
type Agent = {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  phone: string | null;
  address: string | null;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

// Validation schemas
const createAgentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    companyName: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    userId: z.string().uuid('Valid user ID is required').optional(),
  }),
});

const updateAgentSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    companyName: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    userId: z.string().uuid().optional(),
    isActive: z.boolean().optional(),
  }),
});

const agentQuerySchema = z.object({
  query: z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    search: z.string().optional(),
    isActive: z.string().transform(val => val === 'true').optional(),
    sortBy: z.enum(['name', 'email', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

const agentParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Agent ID is required'),
  }),
});

export class AgentController {
  getAllAgents = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('AgentController: getAllAgents called');
      
      const query = req.query;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const search = query.search as string;
      const isActive = query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined;
      const sortBy = (query.sortBy as string) || 'createdAt';
      const sortOrder = (query.sortOrder as string) || 'desc';

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (typeof isActive === 'boolean') {
        where.isActive = isActive;
      }

      // Build orderBy clause
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      const [agents, total] = await Promise.all([
        (prisma as any).agent.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              }
            }
          }
        }),
        (prisma as any).agent.count({ where }),
      ]);

      logger.info(`AgentController: Returning ${agents.length} agents`);
      
      ResponseHelper.paginated(res, agents, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }, 'Agents retrieved successfully');
    } catch (error) {
      logger.error('Get all agents error:', error);
      ResponseHelper.badRequest(res, 'Failed to retrieve agents');
    }
  });

  getAgentById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const agent = await (prisma as any).agent.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            }
          }
        }
      });
      
      if (!agent) {
        ResponseHelper.notFound(res, 'Agent not found');
        return;
      }

      ResponseHelper.success(res, agent, 'Agent retrieved successfully');
    } catch (error) {
      logger.error('Get agent by ID error:', error);
      ResponseHelper.badRequest(res, 'Failed to retrieve agent');
    }
  });

  createAgent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const agent = await (prisma as any).agent.create({
        data: req.body,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            }
          }
        }
      });
      
      logger.info(`AgentController: Created agent ${agent.id}`);
      ResponseHelper.created(res, agent, 'Agent created successfully');
    } catch (error) {
      logger.error('Create agent error:', error);
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        ResponseHelper.badRequest(res, 'Email already exists');
      } else {
        ResponseHelper.badRequest(res, 'Failed to create agent');
      }
    }
  });

  updateAgent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const agent = await (prisma as any).agent.update({
        where: { id },
        data: req.body,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            }
          }
        }
      });
      
      if (!agent) {
        ResponseHelper.notFound(res, 'Agent not found');
        return;
      }

      logger.info(`AgentController: Updated agent ${agent.id}`);
      ResponseHelper.success(res, agent, 'Agent updated successfully');
    } catch (error) {
      logger.error('Update agent error:', error);
      ResponseHelper.badRequest(res, 'Failed to update agent');
    }
  });

  deleteAgent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const agent = await (prisma as any).agent.findUnique({ where: { id } });
      
      if (!agent) {
        ResponseHelper.notFound(res, 'Agent not found');
        return;
      }

      await (prisma as any).agent.delete({ where: { id } });
      
      logger.info(`AgentController: Deleted agent ${agent.id}`);
      ResponseHelper.success(res, null, 'Agent deleted successfully');
    } catch (error) {
      logger.error('Delete agent error:', error);
      ResponseHelper.badRequest(res, 'Failed to delete agent');
    }
  });

  getAgentStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const [total, active, inactive] = await Promise.all([
        (prisma as any).agent.count(),
        (prisma as any).agent.count({ where: { isActive: true } }),
        (prisma as any).agent.count({ where: { isActive: false } }),
      ]);

      const stats = {
        total,
        active,
        inactive,
      };

      ResponseHelper.success(res, stats, 'Agent stats retrieved successfully');
    } catch (error) {
      logger.error('Get agent stats error:', error);
      ResponseHelper.badRequest(res, 'Failed to retrieve agent stats');
    }
  });
}

// Export validation schemas
export {
  createAgentSchema,
  updateAgentSchema,
  agentQuerySchema,
  agentParamsSchema,
};
