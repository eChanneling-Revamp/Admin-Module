import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { PaymentStatus } from '@prisma/client';

export class DashboardService {
  async getDashboardStats(): Promise<any> {
    try {
      const [
        userCount,
        appointmentCount,
        doctorCount,
        hospitalCount,
        paymentStats,
        recentNotifications
      ] = await Promise.all([
        // Get user stats
        prisma.user.count({
          where: { isActive: true }
        }),

        // Get appointment stats
        prisma.appointment.count(),

        // Get doctor stats
        prisma.doctor.count({
          where: { isActive: true }
        }),

        // Get hospital stats
        prisma.hospital.count({
          where: { isActive: true }
        }),

        // Get payment stats (sum of completed amounts)
        prisma.payment.aggregate({
          where: { status: 'COMPLETED' as any },
          _sum: { amount: true },
          _count: { id: true }
        }),

        // Get recent notifications
        prisma.notification.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        })
      ]);

      return {
        users: userCount,
        appointments: appointmentCount,
        doctors: doctorCount,
        hospitals: hospitalCount,
        revenue: paymentStats._sum.amount || 0,
        transactions: paymentStats._count.id,
        recentNotifications: recentNotifications.map(notif => ({
          id: notif.id,
          type: notif.type.toLowerCase(),
          title: notif.title,
          message: notif.message,
          timestamp: notif.createdAt,
          read: notif.isRead,
          user: notif.user?.name || notif.user?.email || 'Unknown'
        }))
      };
    } catch (error) {
      logger.error('Error fetching dashboard stats:', error);
      // Return fallback data
      return {
        users: 0,
        appointments: 0,
        doctors: 0,
        hospitals: 0,
        revenue: 0,
        transactions: 0,
        recentNotifications: []
      };
    }
  }

  async getUserStats() {
    try {
      const [total, active, byRole] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.groupBy({
          by: ['role'],
          _count: { role: true }
        })
      ]);

      return {
        total,
        active,
        byRole: byRole.reduce((acc, item) => {
          acc[item.role] = item._count.role;
          return acc;
        }, {} as Record<string, number>)
      };
    } catch (error) {
      logger.error('Error fetching user stats:', error);
      return { total: 0, active: 0, byRole: {} };
    }
  }

  async getBranchStats() {
    // Return hospital stats as branch stats for now
    try {
      const [total, active] = await Promise.all([
        prisma.hospital.count(),
        prisma.hospital.count({ where: { isActive: true } })
      ]);
      return {
        total,
        active
      };
    } catch (error) {
      logger.error('Error fetching branch stats:', error);
      return { total: 0, active: 0 };
    }
  }

  async getInvoiceStats() {
    try {
      const [total, paid, pending] = await Promise.all([
        prisma.payment.count(),
        prisma.payment.count({ where: { status: PaymentStatus.COMPLETED } }),
        prisma.payment.count({ where: { status: PaymentStatus.PENDING } })
      ]);

      const revenue = await prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _sum: { amount: true }
      });

      return {
        total,
        paid,
        pending,
        revenue: revenue._sum.amount || 0
      };
    } catch (error) {
      logger.error('Error fetching invoice stats:', error);
      return { total: 0, paid: 0, pending: 0, revenue: 0 };
    }
  }

  async getNotifications(userId: string) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
      });

      return notifications.map(notif => ({
        id: notif.id,
        type: notif.type.toLowerCase(),
        title: notif.title,
        message: notif.message,
        timestamp: notif.createdAt,
        read: notif.isRead
      }));
    } catch (error) {
      logger.error('Error getting notifications:', error);
      return [];
    }
  }

  async getAuditStats() {
    try {
      const total = await prisma.auditLog.count();
      const recentActivity = await prisma.auditLog.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      return {
        total,
        byAction: {},
        byResource: {},
        byUser: [],
        recentActivity
      };
    } catch (error) {
      logger.error('Error getting audit stats:', error);
      // Don't throw, return empty stats
      return {
        total: 0,
        byAction: {},
        byResource: {},
        byUser: [],
        recentActivity: 0
      };
    }
  }

  async getRecentActivity(limit: number) {
    try {
      const activities = await prisma.auditLog.findMany({
        take: limit,
        orderBy: { timestamp: 'desc' }
      });

      return activities.map(log => ({
        id: log.id,
        user: log.username || log.user_id || 'Unknown',
        action: log.action,
        resource: log.resource,
        timestamp: log.timestamp,
        details: log.details
      }));
    } catch (error) {
      logger.error('Error getting recent activity:', error);
      return [];
    }
  }

  async getSystemHealth() {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      return {
        status: 'healthy',
        database: 'connected',
        memory: 'normal',
        cpu: 'normal',
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error getting system health:', error);
      return {
        status: 'degraded',
        database: 'disconnected',
        memory: 'unknown',
        cpu: 'unknown',
        timestamp: new Date()
      };
    }
  }

  async getAnalytics(timeframe: 'day' | 'week' | 'month' | 'year') {
    try {
      // Return revenue analytics based on payments
      const payments = await prisma.payment.findMany({
        where: {
          status: 'COMPLETED' as any
        },
        select: {
          amount: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Group by month for 'year' view, or by day for 'month' view
      // For simplicity, we'll just handle monthly grouping for now

      const monthlyData: Record<string, { revenue: number, transactions: number }> = {};

      payments.forEach(payment => {
        const date = new Date(payment.createdAt);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })}`;

        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { revenue: 0, transactions: 0 };
        }

        monthlyData[monthYear].revenue += Number(payment.amount);
        monthlyData[monthYear].transactions += 1;
      });

      // Convert to array format expected by charts
      const chartData = Object.entries(monthlyData).map(([name, data]) => ({
        name,
        revenue: data.revenue,
        transactions: data.transactions
      }));

      return {
        chartData,
        summary: {
          totalRevenue: payments.reduce((sum, p) => sum + Number(p.amount), 0),
          totalTransactions: payments.length
        }
      };
    } catch (error) {
      logger.error('Error getting analytics:', error);
      return {
        chartData: [],
        summary: { totalRevenue: 0, totalTransactions: 0 }
      };
    }
  }
}

export default new DashboardService();
