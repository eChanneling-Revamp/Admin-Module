import { Request, Response } from 'express';
import { z } from 'zod';
import { EmailService } from '../services/EmailService';
import { DashboardService } from '../services/DashboardService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../middlewares/error.middleware';
import { logger } from '../config/logger';

// Validation schemas
const sendNotificationSchema = z.object({
  body: z.object({
    to: z.union([z.string().email(), z.array(z.string().email())]),
    title: z.string().min(1, 'Title is required'),
    message: z.string().min(1, 'Message is required'),
    type: z.enum(['info', 'success', 'warning', 'error']).optional(),
  }),
});

const sendBulkEmailSchema = z.object({
  body: z.object({
    recipients: z.array(z.object({
      email: z.string().email(),
      name: z.string().optional(),
    })),
    subject: z.string().min(1, 'Subject is required'),
    content: z.string().min(1, 'Content is required'),
    isHtml: z.boolean().optional(),
  }),
});

const sendCustomEmailSchema = z.object({
  body: z.object({
    to: z.union([z.string().email(), z.array(z.string().email())]),
    subject: z.string().min(1, 'Subject is required'),
    content: z.string().min(1, 'Content is required'),
    isHtml: z.boolean().optional(),
  }),
});

export class NotificationController {
  private emailService = new EmailService();
  private dashboardService = new DashboardService();

  getUserNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return ResponseHelper.unauthorized(res, 'User not authenticated');
    }

    try {
      const notifications = await this.dashboardService.getNotifications(userId);
      return ResponseHelper.success(res, notifications, 'Notifications retrieved successfully');
    } catch (error) {
      logger.error('Get notifications error:', error);
      return ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve notifications');
    }
  });

  sendNotification = asyncHandler(async (req: Request, res: Response) => {
    const { to, title, message, type = 'info' } = req.body;

    try {
      const result = await this.emailService.sendNotificationEmail(to, title, message, type);
      
      if (result) {
        ResponseHelper.success(res, null, 'Notification sent successfully');
      } else {
        ResponseHelper.badRequest(res, 'Failed to send notification');
      }
    } catch (error) {
      logger.error('Send notification error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to send notification');
    }
  });

  sendBulkEmail = asyncHandler(async (req: Request, res: Response) => {
    const { recipients, subject, content, isHtml = true } = req.body;

    try {
      const result = await this.emailService.sendBulkEmail(recipients, subject, content, isHtml);
      
      ResponseHelper.success(res, result, `Bulk email sent: ${result.success} successful, ${result.failed} failed`);
    } catch (error) {
      logger.error('Send bulk email error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to send bulk email');
    }
  });

  sendCustomEmail = asyncHandler(async (req: Request, res: Response) => {
    const { to, subject, content, isHtml = true } = req.body;

    try {
      const result = await this.emailService.sendCustomEmail(to, subject, content, isHtml);
      
      if (result) {
        ResponseHelper.success(res, null, 'Email sent successfully');
      } else {
        ResponseHelper.badRequest(res, 'Failed to send email');
      }
    } catch (error) {
      logger.error('Send custom email error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to send email');
    }
  });

  sendWelcomeEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email, name } = req.body;

    try {
      const result = await this.emailService.sendWelcomeEmail(email, name);
      
      if (result) {
        ResponseHelper.success(res, null, 'Welcome email sent successfully');
      } else {
        ResponseHelper.badRequest(res, 'Failed to send welcome email');
      }
    } catch (error) {
      logger.error('Send welcome email error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to send welcome email');
    }
  });

  sendPasswordResetEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email, name, resetToken } = req.body;

    try {
      const result = await this.emailService.sendPasswordResetEmail(email, name, resetToken);
      
      if (result) {
        ResponseHelper.success(res, null, 'Password reset email sent successfully');
      } else {
        ResponseHelper.badRequest(res, 'Failed to send password reset email');
      }
    } catch (error) {
      logger.error('Send password reset email error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to send password reset email');
    }
  });
}

// Export validation schemas
export {
  sendNotificationSchema,
  sendBulkEmailSchema,
  sendCustomEmailSchema,
};
