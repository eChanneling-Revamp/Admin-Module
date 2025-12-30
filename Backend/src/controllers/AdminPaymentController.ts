import { Request, Response, NextFunction } from 'express';
import { AdminPaymentService } from '../services/AdminPaymentService';
import { logger } from '../config/logger';
import {
  TransactionSearchQuery,
  RefundRequestQuery,
  ReversalRequestQuery,
  TopUpQuery,
  ReconciliationQuery,
  PaymentAuditLogQuery,
  CreateRefundRequestDTO,
  ApproveRefundDTO,
  RejectRefundDTO,
  ProcessRefundDTO,
  CreateReversalRequestDTO,
  ProcessReversalDTO,
  CreateTopUpDTO,
  ApproveTopUpDTO,
  UpdatePaymentOptionsDTO,
  RunReconciliationDTO,
  PaymentReportParams,
  MemberType,
} from '../types/adminPayment';
import { v4 as uuidv4 } from 'uuid';

const paymentService = new AdminPaymentService();

// Helper to get user context from request
const getUserContext = (req: Request) => ({
  userId: (req as any).user?.id || (req as any).user?.userId,
  email: (req as any).user?.email,
  role: (req as any).user?.role,
  ipAddress: req.ip || req.connection?.remoteAddress,
  userAgent: req.get('User-Agent'),
});

// Helper to parse pagination params
const parsePagination = (query: any) => ({
  page: parseInt(query.page) || 1,
  limit: Math.min(parseInt(query.limit) || 20, 100),
  skip: ((parseInt(query.page) || 1) - 1) * (parseInt(query.limit) || 20),
});

export class AdminPaymentController {
  // ============================================
  // Transaction Search (Read-Only)
  // ============================================

  async searchTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      
      const query: TransactionSearchQuery = {
        searchTerm: req.query.searchTerm as string,
        status: req.query.status as any,
        paymentMethod: req.query.paymentMethod as any,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
        maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined,
        transactionId: req.query.transactionId as string,
        patientEmail: req.query.patientEmail as string,
        doctorId: req.query.doctorId as string,
        hospitalId: req.query.hospitalId as string,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        page,
        limit,
        skip,
      };

      const result = await paymentService.searchTransactions(query, getUserContext(req));

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await paymentService.getTransactionById(id, getUserContext(req));

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const startDate = req.query.startDate 
        ? new Date(req.query.startDate as string) 
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
      const endDate = req.query.endDate 
        ? new Date(req.query.endDate as string) 
        : new Date();

      const result = await paymentService.getPaymentStatistics(startDate, endDate, getUserContext(req));

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // Refund Workflow
  // ============================================

  async createRefundRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: CreateRefundRequestDTO = {
        paymentId: req.body.paymentId,
        refundAmount: parseFloat(req.body.refundAmount),
        refundType: req.body.refundType,
        refundMethod: req.body.refundMethod,
        reason: req.body.reason,
        internalNotes: req.body.internalNotes,
        idempotencyKey: req.body.idempotencyKey || req.header('Idempotency-Key') || uuidv4(),
        metadata: req.body.metadata,
      };

      const result = await paymentService.initiateRefund(dto, getUserContext(req));

      res.status(201).json({
        success: true,
        data: result,
        message: 'Refund request created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getRefundRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = parsePagination(req.query);

      const query: RefundRequestQuery = {
        status: req.query.status as any,
        refundType: req.query.refundType as any,
        paymentId: req.query.paymentId as string,
        memberId: req.query.memberId as string,
        requestedById: req.query.requestedById as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        page,
        limit,
        skip,
      };

      const result = await paymentService.getRefundRequests(query, getUserContext(req));

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRefundRequestById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await paymentService.getRefundRequestById(id, getUserContext(req));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Refund request not found',
        });
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async approveRefund(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: ApproveRefundDTO = {
        refundRequestId: req.params.id,
        internalNotes: req.body.internalNotes,
        idempotencyKey: req.body.idempotencyKey || req.header('Idempotency-Key') || uuidv4(),
      };

      const result = await paymentService.approveRefund(dto, getUserContext(req));

      res.json({
        success: true,
        data: result,
        message: 'Refund request approved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectRefund(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: RejectRefundDTO = {
        refundRequestId: req.params.id,
        rejectionReason: req.body.rejectionReason,
        idempotencyKey: req.body.idempotencyKey || req.header('Idempotency-Key') || uuidv4(),
      };

      if (!dto.rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required',
        });
      }

      const result = await paymentService.rejectRefund(dto, getUserContext(req));

      res.json({
        success: true,
        data: result,
        message: 'Refund request rejected',
      });
    } catch (error) {
      next(error);
    }
  }

  async processRefund(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: ProcessRefundDTO = {
        refundRequestId: req.params.id,
        gatewayRefundId: req.body.gatewayRefundId,
        gatewayResponse: req.body.gatewayResponse,
        idempotencyKey: req.body.idempotencyKey || req.header('Idempotency-Key') || uuidv4(),
      };

      const result = await paymentService.processRefund(dto, getUserContext(req));

      res.json({
        success: true,
        data: result,
        message: 'Refund processed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // Reversal Workflow
  // ============================================

  async createReversalRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: CreateReversalRequestDTO = {
        paymentId: req.body.paymentId,
        reversalType: req.body.reversalType,
        reason: req.body.reason,
        internalNotes: req.body.internalNotes,
        idempotencyKey: req.body.idempotencyKey || req.header('Idempotency-Key') || uuidv4(),
        metadata: req.body.metadata,
      };

      const result = await paymentService.initiateReversal(dto, getUserContext(req));

      res.status(201).json({
        success: true,
        data: result,
        message: 'Reversal request created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getReversalRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = parsePagination(req.query);

      const query: ReversalRequestQuery = {
        status: req.query.status as any,
        reversalType: req.query.reversalType as any,
        paymentId: req.query.paymentId as string,
        memberId: req.query.memberId as string,
        requestedById: req.query.requestedById as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        page,
        limit,
        skip,
      };

      const result = await paymentService.getReversalRequests(query, getUserContext(req));

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReversalRequestById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await paymentService.getReversalRequestById(id, getUserContext(req));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Reversal request not found',
        });
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async processReversal(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: ProcessReversalDTO = {
        reversalRequestId: req.params.id,
        gatewayReversalId: req.body.gatewayReversalId,
        gatewayResponse: req.body.gatewayResponse,
        idempotencyKey: req.body.idempotencyKey || req.header('Idempotency-Key') || uuidv4(),
      };

      const result = await paymentService.processReversal(dto, getUserContext(req));

      res.json({
        success: true,
        data: result,
        message: 'Reversal processed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // Member Top-Up
  // ============================================

  async createTopUp(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: CreateTopUpDTO = {
        memberId: req.body.memberId,
        memberType: req.body.memberType as MemberType,
        amount: parseFloat(req.body.amount),
        topUpMethod: req.body.topUpMethod,
        paymentReference: req.body.paymentReference,
        reason: req.body.reason,
        internalNotes: req.body.internalNotes,
        idempotencyKey: req.body.idempotencyKey || req.header('Idempotency-Key') || uuidv4(),
        metadata: req.body.metadata,
      };

      const result = await paymentService.createTopUp(dto, getUserContext(req));

      res.status(201).json({
        success: true,
        data: result,
        message: 'Top-up created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopUps(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = parsePagination(req.query);

      const query: TopUpQuery = {
        status: req.query.status as any,
        memberId: req.query.memberId as string,
        memberType: req.query.memberType as MemberType,
        processedById: req.query.processedById as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        page,
        limit,
        skip,
      };

      const result = await paymentService.getTopUps(query, getUserContext(req));

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopUpById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await paymentService.getTopUpById(id, getUserContext(req));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Top-up not found',
        });
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async approveTopUp(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: ApproveTopUpDTO = {
        topUpId: req.params.id,
        internalNotes: req.body.internalNotes,
        idempotencyKey: req.body.idempotencyKey || req.header('Idempotency-Key') || uuidv4(),
      };

      const result = await paymentService.approveTopUp(dto, getUserContext(req));

      res.json({
        success: true,
        data: result,
        message: 'Top-up approved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // Member Payment Options
  // ============================================

  async getMemberPaymentOptions(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      const memberType = req.query.memberType as MemberType;

      if (!memberType) {
        return res.status(400).json({
          success: false,
          message: 'memberType query parameter is required',
        });
      }

      const result = await paymentService.getMemberPaymentOptions(memberId, memberType, getUserContext(req));

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMemberPaymentOptions(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: UpdatePaymentOptionsDTO = {
        memberId: req.params.memberId,
        memberType: req.body.memberType as MemberType,
        paymentMethod: req.body.paymentMethod,
        isEnabled: req.body.isEnabled,
        isDefault: req.body.isDefault,
        maxTransactionLimit: req.body.maxTransactionLimit ? parseFloat(req.body.maxTransactionLimit) : undefined,
        dailyLimit: req.body.dailyLimit ? parseFloat(req.body.dailyLimit) : undefined,
        monthlyLimit: req.body.monthlyLimit ? parseFloat(req.body.monthlyLimit) : undefined,
        restrictions: req.body.restrictions,
      };

      const result = await paymentService.updateMemberPaymentOptions(dto, getUserContext(req));

      res.json({
        success: true,
        data: result,
        message: 'Payment options updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // Reconciliation
  // ============================================

  async runReconciliation(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: RunReconciliationDTO = {
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        notes: req.body.notes,
      };

      if (!dto.startDate || !dto.endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate and endDate are required',
        });
      }

      const result = await paymentService.runReconciliation(dto, getUserContext(req));

      res.status(201).json({
        success: true,
        data: result,
        message: 'Reconciliation completed',
      });
    } catch (error) {
      next(error);
    }
  }

  async getReconciliations(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = parsePagination(req.query);

      const query: ReconciliationQuery = {
        status: req.query.status as any,
        performedById: req.query.performedById as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        page,
        limit,
        skip,
      };

      const result = await paymentService.getReconciliations(query, getUserContext(req));

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReconciliationById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await paymentService.getReconciliationById(id, getUserContext(req));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Reconciliation not found',
        });
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // Reports
  // ============================================

  async generateReport(req: Request, res: Response, next: NextFunction) {
    try {
      const params: PaymentReportParams = {
        reportType: req.body.reportType,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        format: req.body.format || 'JSON',
        filters: req.body.filters,
      };

      if (!params.reportType || !params.startDate || !params.endDate) {
        return res.status(400).json({
          success: false,
          message: 'reportType, startDate, and endDate are required',
        });
      }

      const result = await paymentService.generateReport(params, getUserContext(req));

      // For CSV/Excel format, handle differently
      if (params.format === 'CSV') {
        // Convert to CSV (simplified)
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${params.reportType}_${Date.now()}.csv"`);
        // Simple CSV conversion - in production, use a proper CSV library
        return res.send(JSON.stringify(result));
      }

      res.json({
        success: true,
        data: result,
        reportType: params.reportType,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // Audit Logs
  // ============================================

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = parsePagination(req.query);

      const query: PaymentAuditLogQuery = {
        actionType: req.query.actionType as any,
        paymentId: req.query.paymentId as string,
        performedById: req.query.performedById as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        page,
        limit,
        skip,
      };

      const result = await paymentService.getAuditLogs(query, getUserContext(req));

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminPaymentController();
