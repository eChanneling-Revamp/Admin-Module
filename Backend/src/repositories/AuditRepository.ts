import { Prisma, AuditLog } from '@prisma/client';
import { prisma } from '../config/database';
import { AuditLogData } from '../types';

export class AuditRepository {
  async create(data: AuditLogData): Promise<AuditLog> {
    return prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        description: data.description,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async findById(id: string): Promise<AuditLog | null> {
    return prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findMany(query: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    resource?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    sortBy?: 'createdAt' | 'action';
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 10,
      userId,
      action,
      resource,
      resourceId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Prisma.AuditLogWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }

    if (resource) {
      where.resource = resource;
    }

    if (resourceId) {
      where.resourceId = resourceId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    // Build orderBy clause
    const orderBy: Prisma.AuditLogOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
                          },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      auditLogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats(): Promise<{
    total: number;
    byAction: Record<string, number>;
    byResource: Record<string, number>;
    byUser: Array<{
      userId: string;
      userEmail: string;
      count: number;
    }>;
    recentActivity: number;
  }> {
    const [
      total,
      byAction,
      byResource,
      byUser,
      recentActivity,
    ] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: { action: true },
      }),
      prisma.auditLog.groupBy({
        by: ['resource'],
        _count: { resource: true },
      }),
      prisma.auditLog.groupBy({
        by: ['userId'],
        _count: { userId: true },
      }),
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    const actionStats = byAction.reduce((acc, item) => {
      acc[item.action] = item._count.action;
      return acc;
    }, {} as Record<string, number>);

    const resourceStats = byResource.reduce((acc, item) => {
      if (item.resource) {
        acc[item.resource] = item._count.resource;
      }
      return acc;
    }, {} as Record<string, number>);

    // Get user details for byUser stats
    const userIds = byUser.map(item => item.userId).filter(Boolean) as string[];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true },
    });

    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user.email;
      return acc;
    }, {} as Record<string, string>);

    const userStats = byUser
      .filter(item => item.userId)
      .map(item => ({
        userId: item.userId!,
        userEmail: userMap[item.userId!] || 'Unknown',
        count: item._count.userId,
      }));

    return {
      total,
      byAction: actionStats,
      byResource: resourceStats,
      byUser: userStats,
      recentActivity,
    };
  }

  async findRecentActivity(limit: number = 10): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findByResource(resource: string, resourceId: string): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: {
        resource,
        resourceId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findByUser(userId: string, limit: number = 50): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}

export default new AuditRepository();
