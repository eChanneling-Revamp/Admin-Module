import { Request } from 'express';
import { JwtPayload } from '../auth';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Pagination interface
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search interface
export interface SearchQuery extends PaginationQuery {
  search?: string;
}

// Error interface
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Audit log interface
export interface AuditLogData {
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  description?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Notification interface
export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, any>;
}

// Dashboard stats interface
export interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  branches: {
    total: number;
    active: number;
    byType: Record<string, number>;
  };
  invoices: {
    total: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    user?: string;
  }>;
}
