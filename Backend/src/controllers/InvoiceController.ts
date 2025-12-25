import { Request, Response } from 'express';
import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';
import { InvoiceService } from '../services/InvoiceService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../middlewares/error.middleware';
import { logger } from '../config/logger';

// Validation schemas
const createInvoiceSchema = z.object({
  body: z.object({
    branchId: z.string().uuid('Invalid branch ID'),
    amount: z.number().positive('Amount must be positive'),
    dueDate: z.string().datetime().optional(),
    description: z.string().optional(),
  }),
});

const updateInvoiceSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive').optional(),
    status: z.nativeEnum(InvoiceStatus).optional(),
    dueDate: z.string().datetime().optional(),
    description: z.string().optional(),
  }),
});

const paymentSchema = z.object({
  body: z.object({
    invoiceId: z.string().uuid('Invalid invoice ID'),
    amount: z.number().positive('Amount must be positive'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
    notes: z.string().optional(),
  }),
});

const invoiceQuerySchema = z.object({
  query: z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    search: z.string().optional(),
    status: z.nativeEnum(InvoiceStatus).optional(),
    branchId: z.string().uuid().optional(),
    minAmount: z.string().transform(Number).optional(),
    maxAmount: z.string().transform(Number).optional(),
    dueDateFrom: z.string().datetime().optional(),
    dueDateTo: z.string().datetime().optional(),
    sortBy: z.enum(['amount', 'createdAt', 'dueDate', 'paidAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

const invoiceParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid invoice ID'),
  }),
});

export class InvoiceController {
  private invoiceService = new InvoiceService();

  createInvoice = asyncHandler(async (req: Request, res: Response) => {
    const invoiceData = req.body;
    const userId = req.user?.userId;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    try {
      const result = await this.invoiceService.createInvoice(
        invoiceData,
        userId,
        ipAddress,
        userAgent
      );

      ResponseHelper.created(res, result, 'Invoice created successfully');
    } catch (error) {
      logger.error('Create invoice error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to create invoice');
    }
  });

  getInvoiceById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const result = await this.invoiceService.getInvoiceById(id);
      ResponseHelper.success(res, result, 'Invoice retrieved successfully');
    } catch (error) {
      logger.error('Get invoice error:', error);
      if (error instanceof Error && error.message === 'Invoice not found') {
        ResponseHelper.notFound(res, 'Invoice not found');
      } else {
        ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve invoice');
      }
    }
  });

  getInvoices = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query;

    try {
      const result = await this.invoiceService.getInvoices(query);
      ResponseHelper.paginated(res, result.invoices, result.pagination, 'Invoices retrieved successfully');
    } catch (error) {
      logger.error('Get invoices error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve invoices');
    }
  });

  updateInvoice = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user?.userId;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    try {
      const result = await this.invoiceService.updateInvoice(
        id,
        updateData,
        userId,
        ipAddress,
        userAgent
      );

      ResponseHelper.success(res, result, 'Invoice updated successfully');
    } catch (error) {
      logger.error('Update invoice error:', error);
      if (error instanceof Error && error.message === 'Invoice not found') {
        ResponseHelper.notFound(res, 'Invoice not found');
      } else {
        ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to update invoice');
      }
    }
  });

  deleteInvoice = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    try {
      await this.invoiceService.deleteInvoice(id, userId, ipAddress, userAgent);
      ResponseHelper.success(res, null, 'Invoice deleted successfully');
    } catch (error) {
      logger.error('Delete invoice error:', error);
      if (error instanceof Error && error.message === 'Invoice not found') {
        ResponseHelper.notFound(res, 'Invoice not found');
      } else {
        ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to delete invoice');
      }
    }
  });

  processPayment = asyncHandler(async (req: Request, res: Response) => {
    const paymentData = req.body;
    const userId = req.user?.userId;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    try {
      const result = await this.invoiceService.processPayment(
        paymentData,
        userId,
        ipAddress,
        userAgent
      );

      ResponseHelper.success(res, result, 'Payment processed successfully');
    } catch (error) {
      logger.error('Process payment error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to process payment');
    }
  });

  getInvoiceStats = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await this.invoiceService.getInvoiceStats();
      ResponseHelper.success(res, result, 'Invoice statistics retrieved successfully');
    } catch (error) {
      logger.error('Get invoice stats error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve invoice statistics');
    }
  });

  getOverdueInvoices = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await this.invoiceService.getOverdueInvoices();
      ResponseHelper.success(res, result, 'Overdue invoices retrieved successfully');
    } catch (error) {
      logger.error('Get overdue invoices error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve overdue invoices');
    }
  });

  getInvoicesByBranch = asyncHandler(async (req: Request, res: Response) => {
    const { branchId } = req.query;

    if (!branchId || typeof branchId !== 'string') {
      ResponseHelper.badRequest(res, 'Branch ID parameter is required');
      return;
    }

    try {
      const result = await this.invoiceService.getInvoicesByBranch(branchId);
      ResponseHelper.success(res, result, 'Invoices by branch retrieved successfully');
    } catch (error) {
      logger.error('Get invoices by branch error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve invoices by branch');
    }
  });

  sendInvoiceNotification = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await this.invoiceService.sendInvoiceNotification(id);
      ResponseHelper.success(res, null, 'Invoice notification sent successfully');
    } catch (error) {
      logger.error('Send invoice notification error:', error);
      if (error instanceof Error && error.message === 'Invoice not found') {
        ResponseHelper.notFound(res, 'Invoice not found');
      } else {
        ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to send invoice notification');
      }
    }
  });

  markOverdueInvoices = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await this.invoiceService.markOverdueInvoices();
      ResponseHelper.success(res, { updatedCount: result }, 'Overdue invoices marked successfully');
    } catch (error) {
      logger.error('Mark overdue invoices error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to mark overdue invoices');
    }
  });
}

// Export validation schemas
export {
  createInvoiceSchema,
  updateInvoiceSchema,
  paymentSchema,
  invoiceQuerySchema,
  invoiceParamsSchema,
};
