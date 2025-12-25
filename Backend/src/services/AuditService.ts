import { AuditRepository } from '../repositories/AuditRepository';
import { sendMessage, TOPICS } from '../config/kafka';
import { logger } from '../config/logger';
import { AuditLogData } from '../types';

export class AuditService {
  private auditRepository = new AuditRepository();

  async log(auditData: AuditLogData): Promise<void> {
    try {
      // Create audit log
      await this.auditRepository.create(auditData);

      // Send to Kafka for real-time processing
      try {
        await sendMessage(TOPICS.AUDIT_LOG, {
          ...auditData,
          timestamp: new Date(),
        });
      } catch (error) {
        logger.error('Failed to send audit log to Kafka:', error);
      }
    } catch (error) {
      logger.error('Failed to create audit log:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  async getAuditLogs(query: {
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
    return this.auditRepository.findMany(query);
  }

  async getAuditStats() {
    return this.auditRepository.getStats();
  }

  async getRecentActivity(limit: number = 10) {
    return this.auditRepository.findRecentActivity(limit);
  }

  async getResourceHistory(resource: string, resourceId: string) {
    return this.auditRepository.findByResource(resource, resourceId);
  }

  async getUserActivity(userId: string, limit: number = 50) {
    return this.auditRepository.findByUser(userId, limit);
  }

  async cleanupOldLogs(daysToKeep: number = 90) {
    return this.auditRepository.deleteOldLogs(daysToKeep);
  }
}

export default new AuditService();
