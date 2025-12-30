import { AdminPaymentRepository } from '../repositories/AdminPaymentRepository';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { PaymentStatus, PaymentMethod, UserRole } from '@prisma/client';
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
  RefundStatus,
  ReversalStatus,
  TopUpStatus,
  ReconciliationStatus,
  AdminPaymentAction,
  MemberType,
  ReconciliationDiscrepancy,
} from '../types/adminPayment';

interface UserContext {
  userId: string;
  email: string;
  role: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AdminPaymentService {
  private repository = new AdminPaymentRepository();

  // ============================================
  // Transaction Search (Read-Only)
  // ============================================

  async searchTransactions(query: TransactionSearchQuery, user: UserContext) {
    try {
      const result = await this.repository.searchTransactions(query);

      // Log the search action
      await this.logAuditAction({
        actionType: AdminPaymentAction.SEARCH_TRANSACTIONS,
        performedById: user.userId,
        performedByEmail: user.email,
        performedByRole: user.role,
        metadata: {
          query: {
            ...query,
            // Remove sensitive data from logs
            patientEmail: query.patientEmail ? '***' : undefined,
          },
          resultCount: result.pagination.total,
        },
        ipAddress: user.ipAddress,
        userAgent: user.userAgent,
      });

      return result;
    } catch (error) {
      logger.error('Error searching transactions:', error);
      throw error;
    }
  }

  async getTransactionById(paymentId: string, user: UserContext) {
    try {
      const transaction = await this.repository.getTransactionById(paymentId);

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Log the view action
      await this.logAuditAction({
        actionType: AdminPaymentAction.VIEW_TRANSACTION,
        paymentId,
        performedById: user.userId,
        performedByEmail: user.email,
        performedByRole: user.role,
        amount: Number(transaction.amount),
        ipAddress: user.ipAddress,
        userAgent: user.userAgent,
      });

      return transaction;
    } catch (error) {
      logger.error('Error getting transaction:', error);
      throw error;
    }
  }

  async getPaymentStatistics(startDate: Date, endDate: Date, user: UserContext) {
    try {
      return await this.repository.getPaymentStatistics(startDate, endDate);
    } catch (error) {
      logger.error('Error getting payment statistics:', error);
      throw error;
    }
  }

  // ============================================
  // Refund Workflow
  // ============================================

  async initiateRefund(dto: CreateRefundRequestDTO, user: UserContext) {
    try {
      // Check for idempotency
      const existing = await this.repository.findRefundRequestByIdempotencyKey(dto.idempotencyKey);
      if (existing) {
        logger.info('Idempotent refund request found:', dto.idempotencyKey);
        return existing;
      }

      // Get the original payment
      const payment = await this.repository.getTransactionById(dto.paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Validate refund amount
      if (dto.refundAmount <= 0) {
        throw new Error('Refund amount must be positive');
      }

      if (dto.refundAmount > Number(payment.amount)) {
        throw new Error('Refund amount cannot exceed original payment amount');
      }

      // Check if payment is refundable
      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new Error(`Cannot refund payment with status: ${payment.status}`);
      }

      // Check for existing refund requests
      const existingRefunds = payment.refundRequests || [];
      const pendingRefunds = existingRefunds.filter(
        r => !['REJECTED', 'CANCELLED', 'FAILED'].includes(r.status)
      );
      if (pendingRefunds.length > 0) {
        throw new Error('A refund request is already in progress for this payment');
      }

      // Create refund request
      const refundRequest = await this.repository.createRefundRequest({
        paymentId: dto.paymentId,
        originalTransactionId: payment.transactionId || payment.id,
        appointmentId: payment.appointmentId,
        memberId: payment.appointment?.bookedById,
        memberType: payment.appointment?.bookedBy?.role,
        originalAmount: Number(payment.amount),
        refundAmount: dto.refundAmount,
        refundType: dto.refundType,
        refundMethod: dto.refundMethod || 'ORIGINAL_METHOD',
        reason: dto.reason,
        internalNotes: dto.internalNotes,
        requestedById: user.userId,
        requestedByEmail: user.email,
        idempotencyKey: dto.idempotencyKey,
        metadata: dto.metadata,
      });

      // Log audit
      await this.logAuditAction({
        actionType: AdminPaymentAction.INITIATE_REFUND,
        paymentId: dto.paymentId,
        refundRequestId: refundRequest.id,
        performedById: user.userId,
        performedByEmail: user.email,
        performedByRole: user.role,
        amount: dto.refundAmount,
        reason: dto.reason,
        previousState: { paymentStatus: payment.status },
        newState: { refundStatus: 'REQUESTED' },
        idempotencyKey: dto.idempotencyKey,
        ipAddress: user.ipAddress,
        userAgent: user.userAgent,
      });

      logger.info('Refund request initiated:', {
        requestNumber: refundRequest.requestNumber,
        paymentId: dto.paymentId,
        amount: dto.refundAmount,
        requestedBy: user.email,
      });

      return refundRequest;
    } catch (error) {
      logger.error('Error initiating refund:', error);
      throw error;
    }
  }

  async approveRefund(dto: ApproveRefundDTO, user: UserContext) {
    try {
      // Check idempotency
      const existingLog = await this.repository.findAuditLogByIdempotencyKey(dto.idempotencyKey);
      if (existingLog) {
        logger.info('Idempotent refund approval found:', dto.idempotencyKey);
        return await this.repository.findRefundRequestById(dto.refundRequestId);
      }

      const refundRequest = await this.repository.findRefundRequestById(dto.refundRequestId);
      if (!refundRequest) {
        throw new Error('Refund request not found');
      }

      if (refundRequest.status !== RefundStatus.REQUESTED && refundRequest.status !== RefundStatus.PENDING_APPROVAL) {
        throw new Error(`Cannot approve refund with status: ${refundRequest.status}`);
      }

      // Cannot approve own request
      if (refundRequest.requestedById === user.userId) {
        throw new Error('Cannot approve your own refund request');
      }

      const previousStatus = refundRequest.status;

      const updated = await this.repository.updateRefundRequest(dto.refundRequestId, {
        status: RefundStatus.APPROVED,
        approvedById: user.userId,
        approvedByEmail: user.email,
        approvedAt: new Date(),
        internalNotes: dto.internalNotes 
          ? `${refundRequest.internalNotes || ''}\n[Approval Note]: ${dto.internalNotes}`
          : refundRequest.internalNotes,
      });

      // Log audit
      await this.logAuditAction({
        actionType: AdminPaymentAction.APPROVE_REFUND,
        paymentId: refundRequest.paymentId,
        refundRequestId: dto.refundRequestId,
        performedById: user.userId,
        performedByEmail: user.email,
        performedByRole: user.role,
        amount: Number(refundRequest.refundAmount),
        previousState: { status: previousStatus },
        newState: { status: RefundStatus.APPROVED },
        idempotencyKey: dto.idempotencyKey,
        ipAddress: user.ipAddress,
        userAgent: user.userAgent,
      });

      logger.info('Refund approved:', {
        requestNumber: refundRequest.requestNumber,
        approvedBy: user.email,
      });

      return updated;
    } catch (error) {
      logger.error('Error approving refund:', error);
      throw error;
    }
  }

  async rejectRefund(dto: RejectRefundDTO, user: UserContext) {
    try {
      // Check idempotency
      const existingLog = await this.repository.findAuditLogByIdempotencyKey(dto.idempotencyKey);
      if (existingLog) {
        return await this.repository.findRefundRequestById(dto.refundRequestId);
      }

      const refundRequest = await this.repository.findRefundRequestById(dto.refundRequestId);
      if (!refundRequest) {
        throw new Error('Refund request not found');
      }

      if (!['REQUESTED', 'PENDING_APPROVAL', 'APPROVED'].includes(refundRequest.status)) {
        throw new Error(`Cannot reject refund with status: ${refundRequest.status}`);
      }

      const previousStatus = refundRequest.status;

      const updated = await this.repository.updateRefundRequest(dto.refundRequestId, {
        status: RefundStatus.REJECTED,
        rejectedById: user.userId,
        rejectedByEmail: user.email,
        rejectedAt: new Date(),
        rejectionReason: dto.rejectionReason,
      });

      // Log audit
      await this.logAuditAction({
        actionType: AdminPaymentAction.REJECT_REFUND,
        paymentId: refundRequest.paymentId,
        refundRequestId: dto.refundRequestId,
        performedById: user.userId,
        performedByEmail: user.email,
        performedByRole: user.role,
        amount: Number(refundRequest.refundAmount),
        reason: dto.rejectionReason,
        previousState: { status: previousStatus },
        newState: { status: RefundStatus.REJECTED },
        idempotencyKey: dto.idempotencyKey,
        ipAddress: user.ipAddress,
        userAgent: user.userAgent,
      });

      logger.info('Refund rejected:', {
        requestNumber: refundRequest.requestNumber,
        rejectedBy: user.email,
        reason: dto.rejectionReason,
      });

      return updated;
    } catch (error) {
      logger.error('Error rejecting refund:', error);
      throw error;
    }
  }

  async processRefund(dto: ProcessRefundDTO, user: UserContext) {
    try {
      // Check idempotency
      const existingLog = await this.repository.findAuditLogByIdempotencyKey(dto.idempotencyKey);
      if (existingLog) {
        return await this.repository.findRefundRequestById(dto.refundRequestId);
      }

      const refundRequest = await this.repository.findRefundRequestById(dto.refundRequestId);
      if (!refundRequest) {
        throw new Error('Refund request not found');
      }

      if (refundRequest.status !== RefundStatus.APPROVED) {
        throw new Error(`Cannot process refund with status: ${refundRequest.status}`);
      }

      const previousStatus = refundRequest.status;

      // Update refund request to PROCESSING
      await this.repository.updateRefundRequest(dto.refundRequestId, {
        status: RefundStatus.PROCESSING,
        processedById: user.userId,
        processedByEmail: user.email,
        processedAt: new Date(),
      });

      // Here you would integrate with actual payment gateway for refund
      // For now, we'll simulate a successful refund

      // Update to PROCESSED/COMPLETED
      const updated = await this.repository.updateRefundRequest(dto.refundRequestId, {
        status: RefundStatus.COMPLETED,
        completedAt: new Date(),
        gatewayRefundId: dto.gatewayRefundId,
        gatewayResponse: dto.gatewayResponse,
      });

      // Update the original payment status
      await prisma.payment.update({
        where: { id: refundRequest.paymentId },
        data: {
          status: PaymentStatus.REFUNDED,
          refundedAt: new Date(),
          refundAmount: refundRequest.refundAmount,
        },
      });

      // Log audit
      await this.logAuditAction({
        actionType: AdminPaymentAction.COMPLETE_REFUND,
        paymentId: refundRequest.paymentId,
        refundRequestId: dto.refundRequestId,
        performedById: user.userId,
        performedByEmail: user.email,
        performedByRole: user.role,
        amount: Number(refundRequest.refundAmount),
        previousState: { status: previousStatus },
        newState: { status: RefundStatus.COMPLETED, paymentStatus: PaymentStatus.REFUNDED },
        metadata: { gatewayRefundId: dto.gatewayRefundId },
        idempotencyKey: dto.idempotencyKey,
        ipAddress: user.ipAddress,
        userAgent: user.userAgent,
      });

      logger.info('Refund completed:', {
        requestNumber: refundRequest.requestNumber,
        processedBy: user.email,
        gatewayRefundId: dto.gatewayRefundId,
      });

      return updated;
    } catch (error) {
      logger.error('Error processing refund:', error);
      throw error;
    }
  }

  async getRefundRequests(query: RefundRequestQuery, user: UserContext) {
    return this.repository.findRefundRequests(query);
  }

  async getRefundRequestById(id: string, user: UserContext) {
    return this.repository.findRefundRequestById(id);
  }

  // ============================================
  // Reversal Workflow
  // ============================================

  async initiateReversal(dto: CreateReversalRequestDTO, user: UserContext) {
    try {
      // Check idempotency
      const existing = await this.repository.findReversalRequestByIdempotencyKey(dto.idempotencyKey);
      if (existing) {
        logger.info('Idempotent reversal request found:', dto.idempotencyKey);
        return existing;
      }

      // Get the payment
      const payment = await this.repository.getTransactionById(dto.paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Check for existing reversal requests
      const existingReversals = payment.reversalRequests || [];
      const pendingReversals = existingReversals.filter(
        r => !['COMPLETED', 'CANCELLED', 'FAILED'].includes(r.status)
      );
      if (pendingReversals.length > 0) {
        throw new Error('A reversal request is already in progress for this payment');
      }

      // Create reversal request
      const reversalRequest = await this.repository.createReversalRequest({
        paymentId: dto.paymentId,
        originalTransactionId: payment.transactionId || payment.id,
        appointmentId: payment.appointmentId,
        memberId: payment.appointment?.bookedById,
        memberType: payment.appointment?.bookedBy?.role,
        originalAmount: Number(payment.amount),
        reversalType: dto.reversalType,
        reason: dto.reason,
        internalNotes: dto.internalNotes,
        requestedById: user.userId,
        requestedByEmail: user.email,
        idempotencyKey: dto.idempotencyKey,
        metadata: dto.metadata,
      });

      // Log audit
      await this.logAuditAction({
        actionType: AdminPaymentAction.INITIATE_REVERSAL,
        paymentId: dto.paymentId,
        reversalRequestId: reversalRequest.id,
        performedById: user.userId,
        performedByEmail: user.email,
        performedByRole: user.role,
        amount: Number(payment.amount),
        reason: dto.reason,
        previousState: { paymentStatus: payment.status },
        newState: { reversalStatus: 'PENDING' },
        idempotencyKey: dto.idempotencyKey,
        ipAddress: user.ipAddress,
        userAgent: user.userAgent,
      });

      logger.info('Reversal request initiated:', {
        requestNumber: reversalRequest.requestNumber,
        paymentId: dto.paymentId,
        type: dto.reversalType,
        requestedBy: user.email,
      });

      return reversalRequest;
    } catch (error) {
      logger.error('Error initiating reversal:', error);
      throw error;
    }
  }

  async processReversal(dto: ProcessReversalDTO, user: UserContext) {
    try {
      // Check idempotency
      const existingLog = await this.repository.findAuditLogByIdempotencyKey(dto.idempotencyKey);
      if (existingLog) {
        return await this.repository.findReversalRequestById(dto.reversalRequestId);
      }

      const reversalRequest = await this.repository.findReversalRequestById(dto.reversalRequestId);
      if (!reversalRequest) {
        throw new Error('Reversal request not found');
      }

      if (reversalRequest.status !== ReversalStatus.PENDING) {
        throw new Error(`Cannot process reversal with status: ${reversalRequest.status}`);
      }

      const previousStatus = reversalRequest.status;

      // Update to IN_PROGRESS
      await this.repository.updateReversalRequest(dto.reversalRequestId, {
        status: ReversalStatus.IN_PROGRESS,
        processedById: user.userId,
        processedByEmail: user.email,
        processedAt: new Date(),
      });

      // Here you would integrate with payment gateway for reversal
      // For now, simulate successful reversal

      // Update to COMPLETED
      const updated = await this.repository.updateReversalRequest(dto.reversalRequestId, {
        status: ReversalStatus.COMPLETED,
        completedAt: new Date(),
        gatewayReversalId: dto.gatewayReversalId,
        gatewayResponse: dto.gatewayResponse,
      });

      // Update the original payment status
      await prisma.payment.update({
        where: { id: reversalRequest.paymentId },
        data: {
          status: PaymentStatus.CANCELLED,
        },
      });

      // Log audit
      await this.logAuditAction({
        actionType: AdminPaymentAction.COMPLETE_REVERSAL,
        paymentId: reversalRequest.paymentId,
        reversalRequestId: dto.reversalRequestId,
        performedById: user.userId,
        performedByEmail: user.email,
        performedByRole: user.role,
        amount: Number(reversalRequest.originalAmount),
        previousState: { status: previousStatus },
        newState: { status: ReversalStatus.COMPLETED, paymentStatus: PaymentStatus.CANCELLED },
        metadata: { gatewayReversalId: dto.gatewayReversalId },
        idempotencyKey: dto.idempotencyKey,
        ipAddress: user.ipAddress,
        userAgent: user.userAgent,
      });

      logger.info('Reversal completed:', {
        requestNumber: reversalRequest.requestNumber,
        processedBy: user.email,
      });

      return updated;
    } catch (error) {
      logger.error('Error processing reversal:', error);
      throw error;
    }
  }

  async getReversalRequests(query: ReversalRequestQuery, user: UserContext) {
    return this.repository.findReversalRequests(query);
  }

  async getReversalRequestById(id: string, user: UserContext) {
    return this.repository.findReversalRequestById(id);
  }

  // ============================================
  // Member Top-Up
  // ============================================

  async createTopUp(dto: CreateTopUpDTO, user: UserContext) {
    try {
      // Check idempotency
      const existing = await this.repository.findTopUpByIdempotencyKey(dto.idempotencyKey);
      if (existing) {
        logger.info('Idempotent top-up found:', dto.idempotencyKey);
        return existing;
      }

      // Get member info
      let memberInfo: { email?: string; name?: string; balance: number } = { balance: 0 };

      // Here you would fetch actual member balance from your system
      // For now, we'll use placeholder values
      const previousBalance = 0; // Should come from actual balance lookup
      const newBalance = previousBalance + dto.amount;

      const topUp = await this.repository.createTopUp({
        memberId: dto.memberId,
        memberType: dto.memberType,
        memberEmail: memberInfo.email,
        memberName: memberInfo.name,
        amount: dto.amount,
        previousBalance,
        newBalance,
        topUpMethod: dto.topUpMethod,
        paymentReference: dto.paymentReference,
        reason: dto.reason,
        internalNotes: dto.internalNotes,
        processedById: user.userId,
        processedByEmail: user.email,
        idempotencyKey: dto.idempotencyKey,
        metadata: dto.metadata,
      });

      // Log audit
      await this.logAuditAction({
        actionType: AdminPaymentAction.TOP_UP_MEMBER,
        topUpId: topUp.id,
        performedById: user.userId,
        performedByEmail: user.email,
        performedByRole: user.role,
        amount: dto.amount,
        reason: dto.reason,
        previousState: { balance: previousBalance },
        newState: { balance: newBalance, status: 'PENDING' },
        metadata: {
          memberId: dto.memberId,
          memberType: dto.memberType,
          topUpMethod: dto.topUpMethod,
        },
        idempotencyKey: dto.idempotencyKey,
        ipAddress: user.ipAddress,
        userAgent: user.userAgent,
      });

      logger.info('Top-up created:', {
        topUpNumber: topUp.topUpNumber,
        memberId: dto.memberId,
        amount: dto.amount,
        processedBy: user.email,
      });

      return topUp;
    } catch (error) {
      logger.error('Error creating top-up:', error);
      throw error;
    }
  }

  async approveTopUp(dto: ApproveTopUpDTO, user: UserContext) {
    try {
      // Check idempotency
      const existingLog = await this.repository.findAuditLogByIdempotencyKey(dto.idempotencyKey);
      if (existingLog) {
        return await this.repository.findTopUpById(dto.topUpId);
      }

      const topUp = await this.repository.findTopUpById(dto.topUpId);
      if (!topUp) {
        throw new Error('Top-up not found');
      }

      if (topUp.status !== TopUpStatus.PENDING && topUp.status !== TopUpStatus.PENDING_APPROVAL) {
        throw new Error(`Cannot approve top-up with status: ${topUp.status}`);
      }

      // Cannot approve own top-up
      if (topUp.processedById === user.userId) {
        throw new Error('Cannot approve your own top-up');
      }

      const previousStatus = topUp.status;

      const updated = await this.repository.updateTopUp(dto.topUpId, {
        status: TopUpStatus.COMPLETED,
        approvedById: user.userId,
        approvedByEmail: user.email,
        approvedAt: new Date(),
        completedAt: new Date(),
        internalNotes: dto.internalNotes
          ? `${topUp.internalNotes || ''}\n[Approval Note]: ${dto.internalNotes}`
          : topUp.internalNotes,
      });

      // Here you would actually update the member's balance in your system

      // Log audit
      await this.logAuditAction({
        actionType: AdminPaymentAction.APPROVE_TOP_UP,
        topUpId: dto.topUpId,
        performedById: user.userId,
        performedByEmail: user.email,
        performedByRole: user.role,
        amount: Number(topUp.amount),
        previousState: { status: previousStatus },
        newState: { status: TopUpStatus.COMPLETED },
        idempotencyKey: dto.idempotencyKey,
        ipAddress: user.ipAddress,
        userAgent: user.userAgent,
      });

      logger.info('Top-up approved:', {
        topUpNumber: topUp.topUpNumber,
        approvedBy: user.email,
      });

      return updated;
    } catch (error) {
      logger.error('Error approving top-up:', error);
      throw error;
    }
  }

  async getTopUps(query: TopUpQuery, user: UserContext) {
    return this.repository.findTopUps(query);
  }

  async getTopUpById(id: string, user: UserContext) {
    return this.repository.findTopUpById(id);
  }

  // ============================================
  // Member Payment Options
  // ============================================

  async getMemberPaymentOptions(memberId: string, memberType: MemberType, user: UserContext) {
    return this.repository.findMemberPaymentOptions(memberId, memberType);
  }

  async updateMemberPaymentOptions(dto: UpdatePaymentOptionsDTO, user: UserContext) {
    try {
      const updated = await this.repository.upsertMemberPaymentOption({
        memberId: dto.memberId,
        memberType: dto.memberType,
        paymentMethod: dto.paymentMethod,
        isEnabled: dto.isEnabled,
        isDefault: dto.isDefault,
        maxTransactionLimit: dto.maxTransactionLimit,
        dailyLimit: dto.dailyLimit,
        monthlyLimit: dto.monthlyLimit,
        restrictions: dto.restrictions,
        configuredById: user.userId,
        configuredByEmail: user.email,
      });

      // Log audit
      await this.logAuditAction({
        actionType: AdminPaymentAction.UPDATE_PAYMENT_OPTIONS,
        performedById: user.userId,
        performedByEmail: user.email,
        performedByRole: user.role,
        metadata: {
          memberId: dto.memberId,
          memberType: dto.memberType,
          paymentMethod: dto.paymentMethod,
          isEnabled: dto.isEnabled,
        },
        ipAddress: user.ipAddress,
        userAgent: user.userAgent,
      });

      logger.info('Payment options updated:', {
        memberId: dto.memberId,
        memberType: dto.memberType,
        paymentMethod: dto.paymentMethod,
        configuredBy: user.email,
      });

      return updated;
    } catch (error) {
      logger.error('Error updating payment options:', error);
      throw error;
    }
  }

  // ============================================
  // Reconciliation
  // ============================================

  async runReconciliation(dto: RunReconciliationDTO, user: UserContext) {
    try {
      // Get all payments in the date range
      const paymentsResult = await this.repository.searchTransactions({
        startDate: dto.startDate,
        endDate: dto.endDate,
        limit: 10000, // Get all transactions
      });

      const payments = paymentsResult.data;

      // Find incomplete/mismatched transactions
      const incompletePayments = await this.repository.findIncompleteTransactions(
        dto.startDate,
        dto.endDate
      );

      // Calculate statistics
      const totalTransactions = payments.length;
      const matchedTransactions = payments.filter(
        p => p.status === PaymentStatus.COMPLETED && p.transactionId
      ).length;
      const mismatchedTransactions = payments.filter(
        p => p.status === PaymentStatus.COMPLETED && !p.transactionId
      ).length;
      const incompleteTransactions = incompletePayments.length;

      const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const matchedAmount = payments
        .filter(p => p.status === PaymentStatus.COMPLETED && p.transactionId)
        .reduce((sum, p) => sum + Number(p.amount), 0);
      const mismatchedAmount = totalAmount - matchedAmount;

      // Identify discrepancies
      const discrepancies: ReconciliationDiscrepancy[] = [];

      // Check for incomplete payments
      incompletePayments.forEach(payment => {
        discrepancies.push({
          paymentId: payment.id,
          transactionId: payment.transactionId,
          expectedStatus: PaymentStatus.COMPLETED,
          actualStatus: payment.status,
          expectedAmount: Number(payment.amount),
          actualAmount: Number(payment.amount),
          discrepancyType: payment.status === PaymentStatus.PENDING ? 'INCOMPLETE' : 'STATUS_MISMATCH',
          details: `Payment ${payment.id} has status ${payment.status}, expected COMPLETED`,
        });
      });

      // Determine reconciliation status
      let status: ReconciliationStatus;
      if (discrepancies.length === 0) {
        status = ReconciliationStatus.COMPLETED;
      } else {
        status = ReconciliationStatus.COMPLETED_WITH_DISCREPANCIES;
      }

      // Create reconciliation record
      const reconciliation = await this.repository.createReconciliation({
        reconciliationDate: new Date(),
        startDate: dto.startDate,
        endDate: dto.endDate,
        totalTransactions,
        matchedTransactions,
        mismatchedTransactions,
        incompleteTransactions,
        totalAmount,
        matchedAmount,
        mismatchedAmount,
        status,
        summary: {
          successRate: totalTransactions > 0 ? (matchedTransactions / totalTransactions) * 100 : 0,
          discrepancyCount: discrepancies.length,
        },
        discrepancies,
        performedById: user.userId,
        performedByEmail: user.email,
        completedAt: new Date(),
      });

      // Log audit
      await this.logAuditAction({
        actionType: AdminPaymentAction.RUN_RECONCILIATION,
        performedById: user.userId,
        performedByEmail: user.email,
        performedByRole: user.role,
        metadata: {
          reconciliationId: reconciliation.id,
          startDate: dto.startDate,
          endDate: dto.endDate,
          totalTransactions,
          discrepancyCount: discrepancies.length,
        },
        ipAddress: user.ipAddress,
        userAgent: user.userAgent,
      });

      logger.info('Reconciliation completed:', {
        reconciliationNumber: reconciliation.reconciliationNumber,
        totalTransactions,
        discrepancies: discrepancies.length,
        performedBy: user.email,
      });

      return reconciliation;
    } catch (error) {
      logger.error('Error running reconciliation:', error);
      throw error;
    }
  }

  async getReconciliations(query: ReconciliationQuery, user: UserContext) {
    const result = await this.repository.findReconciliations(query);

    // Log audit for viewing
    await this.logAuditAction({
      actionType: AdminPaymentAction.VIEW_RECONCILIATION,
      performedById: user.userId,
      performedByEmail: user.email,
      performedByRole: user.role,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent,
    });

    return result;
  }

  async getReconciliationById(id: string, user: UserContext) {
    return this.repository.findReconciliationById(id);
  }

  // ============================================
  // Reports
  // ============================================

  async generateReport(params: PaymentReportParams, user: UserContext) {
    try {
      let reportData: any;

      switch (params.reportType) {
        case 'DAILY_SUMMARY':
        case 'WEEKLY_SUMMARY':
        case 'MONTHLY_SUMMARY':
        case 'CUSTOM_RANGE':
          reportData = await this.repository.getPaymentStatistics(params.startDate, params.endDate);
          break;

        case 'REFUND_REPORT':
          reportData = await this.repository.findRefundRequests({
            startDate: params.startDate,
            endDate: params.endDate,
            limit: 10000,
          });
          break;

        case 'REVERSAL_REPORT':
          reportData = await this.repository.findReversalRequests({
            startDate: params.startDate,
            endDate: params.endDate,
            limit: 10000,
          });
          break;

        case 'RECONCILIATION_REPORT':
          reportData = await this.repository.findReconciliations({
            startDate: params.startDate,
            endDate: params.endDate,
            limit: 100,
          });
          break;

        default:
          throw new Error(`Unsupported report type: ${params.reportType}`);
      }

      // Log audit
      await this.logAuditAction({
        actionType: AdminPaymentAction.GENERATE_REPORT,
        performedById: user.userId,
        performedByEmail: user.email,
        performedByRole: user.role,
        metadata: {
          reportType: params.reportType,
          startDate: params.startDate,
          endDate: params.endDate,
          format: params.format,
        },
        ipAddress: user.ipAddress,
        userAgent: user.userAgent,
      });

      logger.info('Report generated:', {
        reportType: params.reportType,
        generatedBy: user.email,
      });

      return reportData;
    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  }

  // ============================================
  // Audit Logs
  // ============================================

  async getAuditLogs(query: PaymentAuditLogQuery, user: UserContext) {
    return this.repository.findAuditLogs(query);
  }

  private async logAuditAction(data: {
    actionType: AdminPaymentAction;
    paymentId?: string;
    refundRequestId?: string;
    reversalRequestId?: string;
    topUpId?: string;
    performedById: string;
    performedByEmail: string;
    performedByRole: string;
    previousState?: Record<string, any>;
    newState?: Record<string, any>;
    amount?: number;
    currency?: string;
    reason?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    idempotencyKey?: string;
  }) {
    try {
      await this.repository.createAuditLog(data);
    } catch (error) {
      // Don't fail the main operation if audit logging fails
      logger.error('Failed to create audit log:', error);
    }
  }
}

export default new AdminPaymentService();
