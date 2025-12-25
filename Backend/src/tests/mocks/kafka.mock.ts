// Mock Kafka service for testing
import { jest } from '@jest/globals';

export const mockKafkaService = {
  initialize: jest.fn().mockResolvedValue(undefined as any),
  shutdown: jest.fn().mockResolvedValue(undefined as any),
  subscribeToAllEvents: jest.fn().mockResolvedValue(undefined as any),
  getConnectionStatus: jest.fn().mockReturnValue(true as any),
};

export const mockSendMessage = jest.fn().mockResolvedValue(undefined as any);
export const mockSubscribeToTopic = jest.fn().mockResolvedValue(undefined as any);

// Mock Kafka configuration
jest.mock('../config/kafka', () => ({
  connectKafka: jest.fn().mockResolvedValue(undefined as any),
  disconnectKafka: jest.fn().mockResolvedValue(undefined as any),
  sendMessage: mockSendMessage,
  subscribeToTopic: mockSubscribeToTopic,
  TOPICS: {
    USER_CREATED: 'user.created',
    USER_UPDATED: 'user.updated',
    USER_DELETED: 'user.deleted',
    BRANCH_CREATED: 'branch.created',
    BRANCH_UPDATED: 'branch.updated',
    BRANCH_DELETED: 'branch.deleted',
    INVOICE_CREATED: 'invoice.created',
    INVOICE_UPDATED: 'invoice.updated',
    INVOICE_PAID: 'invoice.paid',
    AUDIT_LOG: 'audit.log',
    NOTIFICATION: 'notification.send',
  },
}));

// Mock email service
jest.mock('../services/EmailService', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendWelcomeEmail: jest.fn().mockResolvedValue(true as any),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true as any),
    sendInvoiceNotification: jest.fn().mockResolvedValue(true as any),
    sendCustomEmail: jest.fn().mockResolvedValue(true as any),
    sendBulkEmail: jest.fn().mockResolvedValue({ success: 1, failed: 0 } as any),
    sendNotificationEmail: jest.fn().mockResolvedValue(true as any),
  })),
}));

// Mock audit service
jest.mock('../services/AuditService', () => ({
  AuditService: jest.fn().mockImplementation(() => ({
    log: jest.fn().mockResolvedValue(undefined as any),
    getAuditLogs: jest.fn().mockResolvedValue({ auditLogs: [], total: 0, page: 1, limit: 10, totalPages: 0 } as any),
    getAuditStats: jest.fn().mockResolvedValue({ total: 0, byAction: {}, byResource: {}, byUser: [], recentActivity: 0 } as any),
    getRecentActivity: jest.fn().mockResolvedValue([] as any),
    getResourceHistory: jest.fn().mockResolvedValue([] as any),
    getUserActivity: jest.fn().mockResolvedValue([] as any),
    cleanupOldLogs: jest.fn().mockResolvedValue(0 as any),
  })),
}));
