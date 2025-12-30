import { z } from 'zod';

// ============================================
// Common Validators
// ============================================

const uuidSchema = z.string().uuid('Invalid UUID format');
const positiveDecimal = z.number().positive('Amount must be positive');
const dateSchema = z.coerce.date();
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// ============================================
// Enum Validators
// ============================================

const paymentStatusEnum = z.enum([
  'PENDING',
  'COMPLETED',
  'FAILED',
  'REFUNDED',
  'CANCELLED',
  'UNPAID',
]);

const paymentMethodEnum = z.enum([
  'CREDIT_CARD',
  'DEBIT_CARD',
  'BANK_TRANSFER',
  'CASH',
  'MOBILE_PAYMENT',
]);

const refundStatusEnum = z.enum([
  'REQUESTED',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'PROCESSING',
  'PROCESSED',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

const refundTypeEnum = z.enum([
  'FULL',
  'PARTIAL',
]);

const refundMethodEnum = z.enum([
  'ORIGINAL_METHOD',
  'BANK_TRANSFER',
  'CREDIT',
  'CASH',
  'OTHER',
]);

const reversalStatusEnum = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

const reversalTypeEnum = z.enum([
  'APPOINTMENT_CANCELLATION',
  'DUPLICATE_PAYMENT',
  'SYSTEM_ERROR',
  'FRAUD',
  'CHARGEBACK',
  'INCOMPLETE_TRANSACTION',
  'OTHER',
]);

const memberTypeEnum = z.enum([
  'PATIENT',
  'DOCTOR',
  'HOSPITAL',
  'AGENT',
  'CORPORATE',
]);

const topUpStatusEnum = z.enum([
  'PENDING',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

const topUpMethodEnum = z.enum([
  'BANK_TRANSFER',
  'CASH',
  'CREDIT_CARD',
  'DEBIT_CARD',
  'CHEQUE',
  'INTERNAL_ADJUSTMENT',
]);

const reconciliationStatusEnum = z.enum([
  'IN_PROGRESS',
  'COMPLETED',
  'COMPLETED_WITH_DISCREPANCIES',
  'FAILED',
]);

const reportTypeEnum = z.enum([
  'DAILY_SUMMARY',
  'WEEKLY_SUMMARY',
  'MONTHLY_SUMMARY',
  'CUSTOM_RANGE',
  'REFUND_REPORT',
  'REVERSAL_REPORT',
  'RECONCILIATION_REPORT',
]);

const reportFormatEnum = z.enum(['JSON', 'CSV', 'PDF', 'EXCEL']);

const auditActionTypeEnum = z.enum([
  'VIEW_TRANSACTION',
  'SEARCH_TRANSACTIONS',
  'EXPORT_TRANSACTIONS',
  'INITIATE_REFUND',
  'APPROVE_REFUND',
  'REJECT_REFUND',
  'PROCESS_REFUND',
  'COMPLETE_REFUND',
  'INITIATE_REVERSAL',
  'COMPLETE_REVERSAL',
  'TOP_UP_MEMBER',
  'APPROVE_TOP_UP',
  'UPDATE_PAYMENT_OPTIONS',
  'RUN_RECONCILIATION',
  'VIEW_RECONCILIATION',
  'GENERATE_REPORT',
  'VIEW_AUDIT_LOG',
]);

// ============================================
// Transaction Search Schemas
// ============================================

export const searchTransactionsSchema = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    status: paymentStatusEnum.optional(),
    paymentMethod: paymentMethodEnum.optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
    minAmount: z.coerce.number().positive().optional(),
    maxAmount: z.coerce.number().positive().optional(),
    transactionId: z.string().optional(),
    patientEmail: z.string().email().optional(),
    doctorId: uuidSchema.optional(),
    hospitalId: uuidSchema.optional(),
    sortBy: z.enum(['createdAt', 'amount', 'status']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    ...paginationSchema.shape,
  }),
});

export const getTransactionByIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

export const getPaymentStatisticsSchema = z.object({
  query: z.object({
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
  }),
});

// ============================================
// Refund Schemas
// ============================================

export const createRefundRequestSchema = z.object({
  body: z.object({
    paymentId: uuidSchema,
    refundAmount: positiveDecimal,
    refundType: refundTypeEnum,
    refundMethod: refundMethodEnum.optional(),
    reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000),
    internalNotes: z.string().max(2000).optional(),
    idempotencyKey: z.string().uuid().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const getRefundRequestsSchema = z.object({
  query: z.object({
    status: refundStatusEnum.optional(),
    refundType: refundTypeEnum.optional(),
    paymentId: uuidSchema.optional(),
    memberId: uuidSchema.optional(),
    requestedById: uuidSchema.optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
    sortBy: z.enum(['createdAt', 'amount', 'status']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    ...paginationSchema.shape,
  }),
});

export const getRefundRequestByIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

export const approveRefundSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    internalNotes: z.string().max(2000).optional(),
    idempotencyKey: z.string().uuid().optional(),
  }),
});

export const rejectRefundSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    rejectionReason: z.string().min(10, 'Rejection reason must be at least 10 characters').max(1000),
    idempotencyKey: z.string().uuid().optional(),
  }),
});

export const processRefundSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    gatewayRefundId: z.string().optional(),
    gatewayResponse: z.record(z.any()).optional(),
    idempotencyKey: z.string().uuid().optional(),
  }),
});

// ============================================
// Reversal Schemas
// ============================================

export const createReversalRequestSchema = z.object({
  body: z.object({
    paymentId: uuidSchema,
    reversalType: reversalTypeEnum,
    reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000),
    internalNotes: z.string().max(2000).optional(),
    idempotencyKey: z.string().uuid().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const getReversalRequestsSchema = z.object({
  query: z.object({
    status: reversalStatusEnum.optional(),
    reversalType: reversalTypeEnum.optional(),
    paymentId: uuidSchema.optional(),
    memberId: uuidSchema.optional(),
    requestedById: uuidSchema.optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
    sortBy: z.enum(['createdAt', 'status']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    ...paginationSchema.shape,
  }),
});

export const getReversalRequestByIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

export const processReversalSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    gatewayReversalId: z.string().optional(),
    gatewayResponse: z.record(z.any()).optional(),
    idempotencyKey: z.string().uuid().optional(),
  }),
});

// ============================================
// Top-Up Schemas
// ============================================

export const createTopUpSchema = z.object({
  body: z.object({
    memberId: uuidSchema,
    memberType: memberTypeEnum,
    amount: positiveDecimal,
    topUpMethod: topUpMethodEnum,
    paymentReference: z.string().max(100).optional(),
    reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
    internalNotes: z.string().max(2000).optional(),
    idempotencyKey: z.string().uuid().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const getTopUpsSchema = z.object({
  query: z.object({
    status: topUpStatusEnum.optional(),
    memberId: uuidSchema.optional(),
    memberType: memberTypeEnum.optional(),
    processedById: uuidSchema.optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
    sortBy: z.enum(['createdAt', 'amount', 'status']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    ...paginationSchema.shape,
  }),
});

export const getTopUpByIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

export const approveTopUpSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    internalNotes: z.string().max(2000).optional(),
    idempotencyKey: z.string().uuid().optional(),
  }),
});

// ============================================
// Member Payment Options Schemas
// ============================================

export const getMemberPaymentOptionsSchema = z.object({
  params: z.object({
    memberId: uuidSchema,
  }),
  query: z.object({
    memberType: memberTypeEnum,
  }),
});

export const updateMemberPaymentOptionsSchema = z.object({
  params: z.object({
    memberId: uuidSchema,
  }),
  body: z.object({
    memberType: memberTypeEnum,
    paymentMethod: paymentMethodEnum,
    isEnabled: z.boolean(),
    isDefault: z.boolean().optional(),
    maxTransactionLimit: positiveDecimal.optional(),
    dailyLimit: positiveDecimal.optional(),
    monthlyLimit: positiveDecimal.optional(),
    restrictions: z.record(z.any()).optional(),
  }),
});

// ============================================
// Reconciliation Schemas
// ============================================

export const runReconciliationSchema = z.object({
  body: z.object({
    startDate: dateSchema,
    endDate: dateSchema,
  }).refine(
    (data) => data.endDate > data.startDate,
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  ),
});

export const getReconciliationsSchema = z.object({
  query: z.object({
    status: reconciliationStatusEnum.optional(),
    performedById: uuidSchema.optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
    sortBy: z.enum(['createdAt', 'reconciliationDate']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    ...paginationSchema.shape,
  }),
});

export const getReconciliationByIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

// ============================================
// Report Schemas
// ============================================

export const generateReportSchema = z.object({
  body: z.object({
    reportType: reportTypeEnum,
    startDate: dateSchema,
    endDate: dateSchema,
    format: reportFormatEnum.optional().default('JSON'),
  }).refine(
    (data) => data.endDate > data.startDate,
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  ),
});

// ============================================
// Audit Log Schemas
// ============================================

export const getAuditLogsSchema = z.object({
  query: z.object({
    actionType: auditActionTypeEnum.optional(),
    paymentId: uuidSchema.optional(),
    performedById: uuidSchema.optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
    sortBy: z.literal('createdAt').optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    ...paginationSchema.shape,
  }),
});

// Export all schemas for easy importing
export const adminPaymentValidationSchemas = {
  // Transactions
  searchTransactionsSchema,
  getTransactionByIdSchema,
  getPaymentStatisticsSchema,
  
  // Refunds
  createRefundRequestSchema,
  getRefundRequestsSchema,
  getRefundRequestByIdSchema,
  approveRefundSchema,
  rejectRefundSchema,
  processRefundSchema,
  
  // Reversals
  createReversalRequestSchema,
  getReversalRequestsSchema,
  getReversalRequestByIdSchema,
  processReversalSchema,
  
  // Top-ups
  createTopUpSchema,
  getTopUpsSchema,
  getTopUpByIdSchema,
  approveTopUpSchema,
  
  // Member Payment Options
  getMemberPaymentOptionsSchema,
  updateMemberPaymentOptionsSchema,
  
  // Reconciliation
  runReconciliationSchema,
  getReconciliationsSchema,
  getReconciliationByIdSchema,
  
  // Reports
  generateReportSchema,
  
  // Audit Logs
  getAuditLogsSchema,
};
