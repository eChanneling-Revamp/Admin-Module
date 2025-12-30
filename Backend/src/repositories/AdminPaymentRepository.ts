import { prisma } from '../config/database';
import { Prisma, PaymentStatus, PaymentMethod } from '@prisma/client';
import { logger } from '../config/logger';
import {
  TransactionSearchQuery,
  RefundRequestQuery,
  ReversalRequestQuery,
  TopUpQuery,
  ReconciliationQuery,
  PaymentAuditLogQuery,
  RefundStatus,
  ReversalStatus,
  TopUpStatus,
  ReconciliationStatus,
  AdminPaymentAction,
  MemberType,
  PaymentAuditLogData,
  ReconciliationSummary,
  ReconciliationDiscrepancy,
} from '../types/adminPayment';

export class AdminPaymentRepository {
  // ============================================
  // Transaction Search (Read-Only)
  // ============================================

  async searchTransactions(query: TransactionSearchQuery) {
    const {
      page = 1,
      limit = 20,
      search,
      transactionId,
      paymentId,
      appointmentId,
      patientName,
      patientEmail,
      patientPhone,
      memberId,
      status,
      paymentMethod,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      hospitalId,
      doctorId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PaymentWhereInput = {};

    if (paymentId) {
      where.id = paymentId;
    }

    if (transactionId) {
      where.transactionId = { contains: transactionId, mode: 'insensitive' };
    }

    if (appointmentId) {
      where.appointmentId = appointmentId;
    }

    if (status) {
      where.status = Array.isArray(status) ? { in: status } : status;
    }

    if (paymentMethod) {
      where.paymentMethod = Array.isArray(paymentMethod) ? { in: paymentMethod } : paymentMethod;
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) {
        where.amount.gte = new Prisma.Decimal(minAmount);
      }
      if (maxAmount !== undefined) {
        where.amount.lte = new Prisma.Decimal(maxAmount);
      }
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

    // Build appointment-related filters
    const appointmentWhere: Prisma.AppointmentWhereInput = {};

    if (search) {
      appointmentWhere.OR = [
        { patientName: { contains: search, mode: 'insensitive' } },
        { patientEmail: { contains: search, mode: 'insensitive' } },
        { patientPhone: { contains: search } },
        { appointmentNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (patientName) {
      appointmentWhere.patientName = { contains: patientName, mode: 'insensitive' };
    }

    if (patientEmail) {
      appointmentWhere.patientEmail = { contains: patientEmail, mode: 'insensitive' };
    }

    if (patientPhone) {
      appointmentWhere.patientPhone = { contains: patientPhone };
    }

    if (memberId) {
      appointmentWhere.bookedById = memberId;
    }

    // Filter by hospital or doctor through session
    if (hospitalId || doctorId) {
      appointmentWhere.session = {};
      if (hospitalId) {
        appointmentWhere.session.hospitalId = hospitalId;
      }
      if (doctorId) {
        appointmentWhere.session.doctorId = doctorId;
      }
    }

    if (Object.keys(appointmentWhere).length > 0) {
      where.appointment = appointmentWhere;
    }

    // Build orderBy
    const orderBy: Prisma.PaymentOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          appointment: {
            select: {
              id: true,
              appointmentNumber: true,
              patientName: true,
              patientEmail: true,
              patientPhone: true,
              consultationFee: true,
              totalAmount: true,
              status: true,
              bookedById: true,
              session: {
                select: {
                  id: true,
                  doctor: {
                    select: {
                      id: true,
                      name: true,
                      specialization: true,
                    },
                  },
                  hospital: {
                    select: {
                      id: true,
                      name: true,
                      city: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTransactionById(paymentId: string) {
    return prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        appointment: {
          include: {
            session: {
              include: {
                doctor: true,
                hospital: true,
              },
            },
            bookedBy: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async getTransactionByTransactionId(transactionId: string) {
    return prisma.payment.findFirst({
      where: { transactionId },
      include: {
        appointment: {
          include: {
            session: {
              include: {
                doctor: true,
                hospital: true,
              },
            },
          },
        },
      },
    });
  }

  // ============================================
  // Payment Statistics
  // ============================================

  async getPaymentStatistics(startDate: Date, endDate: Date) {
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        amount: true,
        status: true,
        paymentMethod: true,
        createdAt: true,
        refundAmount: true,
      },
    });

    const totalTransactions = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    const successful = payments.filter(p => p.status === PaymentStatus.COMPLETED);
    const failed = payments.filter(p => p.status === PaymentStatus.FAILED);
    const pending = payments.filter(p => p.status === PaymentStatus.PENDING);
    const refunded = payments.filter(p => p.status === PaymentStatus.REFUNDED);

    const successfulAmount = successful.reduce((sum, p) => sum + Number(p.amount), 0);
    const failedAmount = failed.reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingAmount = pending.reduce((sum, p) => sum + Number(p.amount), 0);
    const refundedAmount = refunded.reduce((sum, p) => sum + Number(p.refundAmount || p.amount), 0);

    // Group by payment method
    const byPaymentMethod: Record<string, { count: number; amount: number }> = {};
    payments.forEach(p => {
      if (!byPaymentMethod[p.paymentMethod]) {
        byPaymentMethod[p.paymentMethod] = { count: 0, amount: 0 };
      }
      byPaymentMethod[p.paymentMethod].count++;
      byPaymentMethod[p.paymentMethod].amount += Number(p.amount);
    });

    // Group by status
    const byStatus: Record<string, { count: number; amount: number }> = {};
    payments.forEach(p => {
      if (!byStatus[p.status]) {
        byStatus[p.status] = { count: 0, amount: 0 };
      }
      byStatus[p.status].count++;
      byStatus[p.status].amount += Number(p.amount);
    });

    // Daily trend
    const dailyTrend: Record<string, { count: number; amount: number }> = {};
    payments.forEach(p => {
      const date = p.createdAt.toISOString().split('T')[0];
      if (!dailyTrend[date]) {
        dailyTrend[date] = { count: 0, amount: 0 };
      }
      dailyTrend[date].count++;
      dailyTrend[date].amount += Number(p.amount);
    });

    return {
      period: { startDate, endDate },
      totalTransactions,
      totalAmount,
      successfulTransactions: successful.length,
      successfulAmount,
      failedTransactions: failed.length,
      failedAmount,
      pendingTransactions: pending.length,
      pendingAmount,
      refundedTransactions: refunded.length,
      refundedAmount,
      averageTransactionAmount: totalTransactions > 0 ? totalAmount / totalTransactions : 0,
      successRate: totalTransactions > 0 ? (successful.length / totalTransactions) * 100 : 0,
      byPaymentMethod: Object.entries(byPaymentMethod).map(([method, data]) => ({
        method: method as PaymentMethod,
        ...data,
      })),
      byStatus: Object.entries(byStatus).map(([status, data]) => ({
        status: status as PaymentStatus,
        ...data,
      })),
      dailyTrend: Object.entries(dailyTrend)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  // ============================================
  // Refund Requests
  // ============================================

  async createRefundRequest(data: {
    paymentId: string;
    originalTransactionId: string;
    appointmentId?: string;
    memberId?: string;
    memberType?: string;
    originalAmount: number;
    refundAmount: number;
    refundType: string;
    refundMethod: string;
    reason: string;
    internalNotes?: string;
    requestedById: string;
    requestedByEmail: string;
    idempotencyKey: string;
    metadata?: Record<string, any>;
  }) {
    // Generate request number
    const count = await prisma.adminRefundRequest.count();
    const requestNumber = `REF-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    return prisma.adminRefundRequest.create({
      data: {
        requestNumber,
        paymentId: data.paymentId,
        originalTransactionId: data.originalTransactionId,
        appointmentId: data.appointmentId,
        memberId: data.memberId,
        memberType: data.memberType,
        originalAmount: new Prisma.Decimal(data.originalAmount),
        refundAmount: new Prisma.Decimal(data.refundAmount),
        refundType: data.refundType as any,
        refundMethod: data.refundMethod as any,
        status: 'REQUESTED' as any,
        reason: data.reason,
        internalNotes: data.internalNotes,
        requestedById: data.requestedById,
        requestedByEmail: data.requestedByEmail,
        idempotencyKey: data.idempotencyKey,
        metadata: data.metadata,
      },
    });
  }

  async findRefundRequests(query: RefundRequestQuery) {
    const {
      page = 1,
      limit = 20,
      status,
      refundType,
      memberId,
      memberType,
      requestedById,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = Array.isArray(status) ? { in: status } : status;
    }

    if (refundType) {
      where.refundType = refundType;
    }

    if (memberId) {
      where.memberId = memberId;
    }

    if (memberType) {
      where.memberType = memberType;
    }

    if (requestedById) {
      where.requestedById = requestedById;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.refundAmount = {};
      if (minAmount !== undefined) where.refundAmount.gte = new Prisma.Decimal(minAmount);
      if (maxAmount !== undefined) where.refundAmount.lte = new Prisma.Decimal(maxAmount);
    }

    const [data, total] = await Promise.all([
      prisma.adminRefundRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.adminRefundRequest.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findRefundRequestById(id: string) {
    return prisma.adminRefundRequest.findUnique({
      where: { id },
    });
  }

  async findRefundRequestByIdempotencyKey(key: string) {
    return prisma.adminRefundRequest.findUnique({
      where: { idempotencyKey: key },
    });
  }

  async updateRefundRequest(id: string, data: Partial<{
    status: string;
    internalNotes: string;
    approvedById: string;
    approvedByEmail: string;
    approvedAt: Date;
    processedById: string;
    processedByEmail: string;
    processedAt: Date;
    completedAt: Date;
    rejectedById: string;
    rejectedByEmail: string;
    rejectedAt: Date;
    rejectionReason: string;
    gatewayRefundId: string;
    gatewayResponse: any;
  }>) {
    return prisma.adminRefundRequest.update({
      where: { id },
      data: data as any,
    });
  }

  // ============================================
  // Reversal Requests
  // ============================================

  async createReversalRequest(data: {
    paymentId: string;
    originalTransactionId: string;
    appointmentId?: string;
    memberId?: string;
    memberType?: string;
    originalAmount: number;
    reversalType: string;
    reason: string;
    internalNotes?: string;
    autoDetected?: boolean;
    detectionSource?: string;
    requestedById: string;
    requestedByEmail: string;
    idempotencyKey: string;
    metadata?: Record<string, any>;
  }) {
    const count = await prisma.adminReversalRequest.count();
    const requestNumber = `REV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    return prisma.adminReversalRequest.create({
      data: {
        requestNumber,
        paymentId: data.paymentId,
        originalTransactionId: data.originalTransactionId,
        appointmentId: data.appointmentId,
        memberId: data.memberId,
        memberType: data.memberType,
        originalAmount: new Prisma.Decimal(data.originalAmount),
        reversalType: data.reversalType as any,
        status: 'PENDING' as any,
        reason: data.reason,
        internalNotes: data.internalNotes,
        autoDetected: data.autoDetected || false,
        detectionSource: data.detectionSource,
        requestedById: data.requestedById,
        requestedByEmail: data.requestedByEmail,
        idempotencyKey: data.idempotencyKey,
        metadata: data.metadata,
      },
    });
  }

  async findReversalRequests(query: ReversalRequestQuery) {
    const {
      page = 1,
      limit = 20,
      status,
      reversalType,
      memberId,
      autoDetected,
      requestedById,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = Array.isArray(status) ? { in: status } : status;
    }

    if (reversalType) {
      where.reversalType = reversalType;
    }

    if (memberId) {
      where.memberId = memberId;
    }

    if (autoDetected !== undefined) {
      where.autoDetected = autoDetected;
    }

    if (requestedById) {
      where.requestedById = requestedById;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [data, total] = await Promise.all([
      prisma.adminReversalRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.adminReversalRequest.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findReversalRequestById(id: string) {
    return prisma.adminReversalRequest.findUnique({
      where: { id },
    });
  }

  async findReversalRequestByIdempotencyKey(key: string) {
    return prisma.adminReversalRequest.findUnique({
      where: { idempotencyKey: key },
    });
  }

  async updateReversalRequest(id: string, data: Partial<{
    status: string;
    internalNotes: string;
    processedById: string;
    processedByEmail: string;
    processedAt: Date;
    completedAt: Date;
    gatewayReversalId: string;
    gatewayResponse: any;
  }>) {
    return prisma.adminReversalRequest.update({
      where: { id },
      data: data as any,
    });
  }

  // ============================================
  // Member Top-Ups
  // ============================================

  async createTopUp(data: {
    memberId: string;
    memberType: string;
    memberEmail?: string;
    memberName?: string;
    amount: number;
    previousBalance: number;
    newBalance: number;
    topUpMethod: string;
    paymentReference?: string;
    reason?: string;
    internalNotes?: string;
    processedById: string;
    processedByEmail: string;
    idempotencyKey: string;
    metadata?: Record<string, any>;
  }) {
    const count = await prisma.adminMemberTopUp.count();
    const topUpNumber = `TOP-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    return prisma.adminMemberTopUp.create({
      data: {
        topUpNumber,
        memberId: data.memberId,
        memberType: data.memberType as any,
        memberEmail: data.memberEmail,
        memberName: data.memberName,
        amount: new Prisma.Decimal(data.amount),
        previousBalance: new Prisma.Decimal(data.previousBalance),
        newBalance: new Prisma.Decimal(data.newBalance),
        topUpMethod: data.topUpMethod as any,
        paymentReference: data.paymentReference,
        status: 'PENDING' as any,
        reason: data.reason,
        internalNotes: data.internalNotes,
        processedById: data.processedById,
        processedByEmail: data.processedByEmail,
        idempotencyKey: data.idempotencyKey,
        metadata: data.metadata,
      },
    });
  }

  async findTopUps(query: TopUpQuery) {
    const {
      page = 1,
      limit = 20,
      status,
      memberId,
      memberType,
      topUpMethod,
      processedById,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = Array.isArray(status) ? { in: status } : status;
    }

    if (memberId) {
      where.memberId = memberId;
    }

    if (memberType) {
      where.memberType = memberType;
    }

    if (topUpMethod) {
      where.topUpMethod = topUpMethod;
    }

    if (processedById) {
      where.processedById = processedById;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = new Prisma.Decimal(minAmount);
      if (maxAmount !== undefined) where.amount.lte = new Prisma.Decimal(maxAmount);
    }

    const [data, total] = await Promise.all([
      prisma.adminMemberTopUp.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.adminMemberTopUp.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findTopUpById(id: string) {
    return prisma.adminMemberTopUp.findUnique({
      where: { id },
    });
  }

  async findTopUpByIdempotencyKey(key: string) {
    return prisma.adminMemberTopUp.findUnique({
      where: { idempotencyKey: key },
    });
  }

  async updateTopUp(id: string, data: Partial<{
    status: string;
    internalNotes: string;
    approvedById: string;
    approvedByEmail: string;
    approvedAt: Date;
    completedAt: Date;
  }>) {
    return prisma.adminMemberTopUp.update({
      where: { id },
      data: data as any,
    });
  }

  // ============================================
  // Member Payment Options
  // ============================================

  async findMemberPaymentOptions(memberId: string, memberType: string) {
    return prisma.adminMemberPaymentOption.findMany({
      where: {
        memberId,
        memberType: memberType as any,
      },
    });
  }

  async upsertMemberPaymentOption(data: {
    memberId: string;
    memberType: string;
    paymentMethod: PaymentMethod;
    isEnabled: boolean;
    isDefault?: boolean;
    maxTransactionLimit?: number;
    dailyLimit?: number;
    monthlyLimit?: number;
    restrictions?: any;
    configuredById: string;
    configuredByEmail: string;
  }) {
    return prisma.adminMemberPaymentOption.upsert({
      where: {
        memberId_memberType_paymentMethod: {
          memberId: data.memberId,
          memberType: data.memberType as any,
          paymentMethod: data.paymentMethod,
        },
      },
      update: {
        isEnabled: data.isEnabled,
        isDefault: data.isDefault,
        maxTransactionLimit: data.maxTransactionLimit ? new Prisma.Decimal(data.maxTransactionLimit) : null,
        dailyLimit: data.dailyLimit ? new Prisma.Decimal(data.dailyLimit) : null,
        monthlyLimit: data.monthlyLimit ? new Prisma.Decimal(data.monthlyLimit) : null,
        restrictions: data.restrictions,
        configuredById: data.configuredById,
        configuredByEmail: data.configuredByEmail,
      },
      create: {
        memberId: data.memberId,
        memberType: data.memberType as any,
        paymentMethod: data.paymentMethod,
        isEnabled: data.isEnabled,
        isDefault: data.isDefault || false,
        maxTransactionLimit: data.maxTransactionLimit ? new Prisma.Decimal(data.maxTransactionLimit) : null,
        dailyLimit: data.dailyLimit ? new Prisma.Decimal(data.dailyLimit) : null,
        monthlyLimit: data.monthlyLimit ? new Prisma.Decimal(data.monthlyLimit) : null,
        restrictions: data.restrictions,
        configuredById: data.configuredById,
        configuredByEmail: data.configuredByEmail,
      },
    });
  }

  // ============================================
  // Reconciliation
  // ============================================

  async createReconciliation(data: {
    reconciliationDate: Date;
    startDate: Date;
    endDate: Date;
    totalTransactions: number;
    matchedTransactions: number;
    mismatchedTransactions: number;
    incompleteTransactions: number;
    totalAmount: number;
    matchedAmount: number;
    mismatchedAmount: number;
    status: string;
    summary?: any;
    discrepancies?: any;
    performedById: string;
    performedByEmail: string;
    completedAt?: Date;
  }) {
    const count = await prisma.adminPaymentReconciliation.count();
    const reconciliationNumber = `REC-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    return prisma.adminPaymentReconciliation.create({
      data: {
        reconciliationNumber,
        reconciliationDate: data.reconciliationDate,
        startDate: data.startDate,
        endDate: data.endDate,
        totalTransactions: data.totalTransactions,
        matchedTransactions: data.matchedTransactions,
        mismatchedTransactions: data.mismatchedTransactions,
        incompleteTransactions: data.incompleteTransactions,
        totalAmount: new Prisma.Decimal(data.totalAmount),
        matchedAmount: new Prisma.Decimal(data.matchedAmount),
        mismatchedAmount: new Prisma.Decimal(data.mismatchedAmount),
        status: data.status as any,
        summary: data.summary,
        discrepancies: data.discrepancies,
        performedById: data.performedById,
        performedByEmail: data.performedByEmail,
        completedAt: data.completedAt,
      },
    });
  }

  async findReconciliations(query: ReconciliationQuery) {
    const {
      page = 1,
      limit = 20,
      status,
      performedById,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (performedById) {
      where.performedById = performedById;
    }

    if (startDate || endDate) {
      where.reconciliationDate = {};
      if (startDate) where.reconciliationDate.gte = startDate;
      if (endDate) where.reconciliationDate.lte = endDate;
    }

    const [data, total] = await Promise.all([
      prisma.adminPaymentReconciliation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.adminPaymentReconciliation.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findReconciliationById(id: string) {
    return prisma.adminPaymentReconciliation.findUnique({
      where: { id },
    });
  }

  async updateReconciliation(id: string, data: Partial<{
    status: string;
    summary: any;
    discrepancies: any;
    completedAt: Date;
  }>) {
    return prisma.adminPaymentReconciliation.update({
      where: { id },
      data: data as any,
    });
  }

  // Find incomplete/mismatched transactions for reconciliation
  async findIncompleteTransactions(startDate: Date, endDate: Date) {
    return prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        OR: [
          { status: PaymentStatus.PENDING },
          { status: PaymentStatus.FAILED },
          {
            AND: [
              { status: PaymentStatus.COMPLETED },
              { transactionId: null },
            ],
          },
        ],
      },
      include: {
        appointment: {
          select: {
            appointmentNumber: true,
            patientName: true,
            paymentStatus: true,
          },
        },
      },
    });
  }

  // ============================================
  // Audit Logging
  // ============================================

  async createAuditLog(data: PaymentAuditLogData) {
    return prisma.adminPaymentAuditLog.create({
      data: {
        actionType: data.actionType as any,
        paymentId: data.paymentId,
        refundRequestId: data.refundRequestId,
        reversalRequestId: data.reversalRequestId,
        topUpId: data.topUpId,
        performedById: data.performedById,
        performedByEmail: data.performedByEmail,
        performedByRole: data.performedByRole,
        previousState: data.previousState,
        newState: data.newState,
        amount: data.amount ? new Prisma.Decimal(data.amount) : null,
        currency: data.currency || 'LKR',
        reason: data.reason,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        idempotencyKey: data.idempotencyKey,
      },
    });
  }

  async findAuditLogs(query: PaymentAuditLogQuery) {
    const {
      page = 1,
      limit = 50,
      actionType,
      performedById,
      paymentId,
      refundRequestId,
      reversalRequestId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (actionType) {
      where.actionType = Array.isArray(actionType) ? { in: actionType } : actionType;
    }

    if (performedById) {
      where.performedById = performedById;
    }

    if (paymentId) {
      where.paymentId = paymentId;
    }

    if (refundRequestId) {
      where.refundRequestId = refundRequestId;
    }

    if (reversalRequestId) {
      where.reversalRequestId = reversalRequestId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [data, total] = await Promise.all([
      prisma.adminPaymentAuditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.adminPaymentAuditLog.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAuditLogByIdempotencyKey(key: string) {
    return prisma.adminPaymentAuditLog.findUnique({
      where: { idempotencyKey: key },
    });
  }
}

export default new AdminPaymentRepository();
