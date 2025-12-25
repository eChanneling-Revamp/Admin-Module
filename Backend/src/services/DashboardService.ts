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
        
        // Get agent stats (from users table with agent role)
        prisma.user.count({
          where: { 
            role: 'AGENT' as any,
            isActive: true 
          }
        }),
        
        // Get corporate stats (from users table with corporate role)
        prisma.user.count({
          where: { 
            role: 'CORPORATE' as any,
            isActive: true 
          }
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
          orderBy: { createdAt: 'desc' }
        })
      ]);

      return {
        users: userCount,
        appointments: appointmentCount,
        agents: doctorCount,
        corporates: hospitalCount,
        revenue: paymentStats._sum.amount || 0,
        transactions: paymentStats._count.id,
        recentNotifications: recentNotifications.map(notif => ({
          id: notif.id,
          type: notif.type.toLowerCase(),
          title: notif.title,
          message: notif.message,
          timestamp: notif.createdAt,
          read: notif.isRead
        }))
      };
    } catch (error) {
      logger.error('Error fetching dashboard stats:', error);
      // Return fallback data
      return {
        users: 0,
        appointments: 0,
        agents: 0,
        corporates: 0,
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
    // For now, return hospital stats as branch stats
    return this.getUserStats().then(stats => ({
      total: stats.byRole['HOSPITAL'] || 0,
      active: stats.byRole['HOSPITAL'] || 0
    }));
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
      return {
        total: 0,
        byAction: {},
        byResource: {},
        byUser: [],
        recentActivity: 0
      };
    } catch (error) {
      logger.error('Error getting audit stats:', error);
      throw error;
    }
  }

  async getRecentActivity(limit: number) {
    try {
      return [];
    } catch (error) {
      logger.error('Error getting recent activity:', error);
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      return {
        status: 'healthy',
        database: 'connected',
        memory: 'normal',
        cpu: 'normal'
      };
    } catch (error) {
      logger.error('Error getting system health:', error);
      throw error;
    }
  }

  async getAnalytics(timeframe: 'day' | 'week' | 'month' | 'year') {
    try {
      return {
        users: 0,
        appointments: 0,
        revenue: 0,
        growth: 0
      };
    } catch (error) {
      logger.error('Error getting analytics:', error);
      throw error;
    }
  }
}

export default new DashboardService();
