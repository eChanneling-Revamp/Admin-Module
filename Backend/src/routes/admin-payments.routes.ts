import { Router } from 'express';
import AdminPaymentController from '../controllers/AdminPaymentController';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { UserRole } from '@prisma/client';
import {
  searchTransactionsSchema,
  getTransactionByIdSchema,
  getPaymentStatisticsSchema,
  createRefundRequestSchema,
  getRefundRequestsSchema,
  getRefundRequestByIdSchema,
  approveRefundSchema,
  rejectRefundSchema,
  processRefundSchema,
  createReversalRequestSchema,
  getReversalRequestsSchema,
  getReversalRequestByIdSchema,
  processReversalSchema,
  createTopUpSchema,
  getTopUpsSchema,
  getTopUpByIdSchema,
  approveTopUpSchema,
  getMemberPaymentOptionsSchema,
  updateMemberPaymentOptionsSchema,
  runReconciliationSchema,
  getReconciliationsSchema,
  getReconciliationByIdSchema,
  generateReportSchema,
  getAuditLogsSchema,
} from '../validators/adminPayment.validator';

const router = Router();
const controller = AdminPaymentController;

// All routes require authentication
router.use(authenticateToken);

// ============================================
// RBAC Permission Definitions
// ============================================
// Define permission levels for payment admin operations
// Using actual UserRole values from the system
const PAYMENT_VIEWER_ROLES = [UserRole.ADMIN, UserRole.SUPERVISOR];
const PAYMENT_PROCESSOR_ROLES = [UserRole.ADMIN, UserRole.SUPERVISOR];
const PAYMENT_APPROVER_ROLES = [UserRole.ADMIN]; // Only admin can approve
const PAYMENT_RECONCILER_ROLES = [UserRole.ADMIN, UserRole.SUPERVISOR];
const REPORT_VIEWER_ROLES = [UserRole.ADMIN, UserRole.SUPERVISOR];
const AUDIT_VIEWER_ROLES = [UserRole.ADMIN];

// ============================================
// Transaction Routes (Read-Only)
// ============================================

/**
 * @route   GET /api/admin/payments/transactions
 * @desc    Search and list all transactions
 * @access  Admin
 */
router.get(
  '/transactions',
  requireRole(...PAYMENT_VIEWER_ROLES),
  validate(searchTransactionsSchema),
  controller.searchTransactions.bind(controller)
);

/**
 * @route   GET /api/admin/payments/transactions/:id
 * @desc    Get transaction details by ID
 * @access  Admin
 */
router.get(
  '/transactions/:id',
  requireRole(...PAYMENT_VIEWER_ROLES),
  validate(getTransactionByIdSchema),
  controller.getTransactionById.bind(controller)
);

/**
 * @route   GET /api/admin/payments/statistics
 * @desc    Get payment statistics for a date range
 * @access  Admin
 */
router.get(
  '/statistics',
  requireRole(...PAYMENT_VIEWER_ROLES),
  validate(getPaymentStatisticsSchema),
  controller.getPaymentStatistics.bind(controller)
);

// ============================================
// Refund Routes
// ============================================

/**
 * @route   POST /api/admin/payments/refunds
 * @desc    Create a new refund request
 * @access  Admin
 */
router.post(
  '/refunds',
  requireRole(...PAYMENT_PROCESSOR_ROLES),
  validate(createRefundRequestSchema),
  controller.createRefundRequest.bind(controller)
);

/**
 * @route   GET /api/admin/payments/refunds
 * @desc    List all refund requests
 * @access  Admin
 */
router.get(
  '/refunds',
  requireRole(...PAYMENT_VIEWER_ROLES),
  validate(getRefundRequestsSchema),
  controller.getRefundRequests.bind(controller)
);

/**
 * @route   GET /api/admin/payments/refunds/:id
 * @desc    Get refund request details
 * @access  Admin
 */
router.get(
  '/refunds/:id',
  requireRole(...PAYMENT_VIEWER_ROLES),
  validate(getRefundRequestByIdSchema),
  controller.getRefundRequestById.bind(controller)
);

/**
 * @route   PUT /api/admin/payments/refunds/:id/approve
 * @desc    Approve a refund request
 * @access  Super Admin Only
 */
router.put(
  '/refunds/:id/approve',
  requireRole(...PAYMENT_APPROVER_ROLES),
  validate(approveRefundSchema),
  controller.approveRefund.bind(controller)
);

/**
 * @route   PUT /api/admin/payments/refunds/:id/reject
 * @desc    Reject a refund request
 * @access  Super Admin Only
 */
router.put(
  '/refunds/:id/reject',
  requireRole(...PAYMENT_APPROVER_ROLES),
  validate(rejectRefundSchema),
  controller.rejectRefund.bind(controller)
);

/**
 * @route   PUT /api/admin/payments/refunds/:id/process
 * @desc    Process an approved refund
 * @access  Admin
 */
router.put(
  '/refunds/:id/process',
  requireRole(...PAYMENT_PROCESSOR_ROLES),
  validate(processRefundSchema),
  controller.processRefund.bind(controller)
);

// ============================================
// Reversal Routes
// ============================================

/**
 * @route   POST /api/admin/payments/reversals
 * @desc    Create a new reversal request
 * @access  Admin
 */
router.post(
  '/reversals',
  requireRole(...PAYMENT_PROCESSOR_ROLES),
  validate(createReversalRequestSchema),
  controller.createReversalRequest.bind(controller)
);

/**
 * @route   GET /api/admin/payments/reversals
 * @desc    List all reversal requests
 * @access  Admin
 */
router.get(
  '/reversals',
  requireRole(...PAYMENT_VIEWER_ROLES),
  validate(getReversalRequestsSchema),
  controller.getReversalRequests.bind(controller)
);

/**
 * @route   GET /api/admin/payments/reversals/:id
 * @desc    Get reversal request details
 * @access  Admin
 */
router.get(
  '/reversals/:id',
  requireRole(...PAYMENT_VIEWER_ROLES),
  validate(getReversalRequestByIdSchema),
  controller.getReversalRequestById.bind(controller)
);

/**
 * @route   PUT /api/admin/payments/reversals/:id/process
 * @desc    Process a reversal request
 * @access  Admin
 */
router.put(
  '/reversals/:id/process',
  requireRole(...PAYMENT_PROCESSOR_ROLES),
  validate(processReversalSchema),
  controller.processReversal.bind(controller)
);

// ============================================
// Top-Up Routes
// ============================================

/**
 * @route   POST /api/admin/payments/topups
 * @desc    Create a new member top-up
 * @access  Admin
 */
router.post(
  '/topups',
  requireRole(...PAYMENT_PROCESSOR_ROLES),
  validate(createTopUpSchema),
  controller.createTopUp.bind(controller)
);

/**
 * @route   GET /api/admin/payments/topups
 * @desc    List all top-ups
 * @access  Admin
 */
router.get(
  '/topups',
  requireRole(...PAYMENT_VIEWER_ROLES),
  validate(getTopUpsSchema),
  controller.getTopUps.bind(controller)
);

/**
 * @route   GET /api/admin/payments/topups/:id
 * @desc    Get top-up details
 * @access  Admin
 */
router.get(
  '/topups/:id',
  requireRole(...PAYMENT_VIEWER_ROLES),
  validate(getTopUpByIdSchema),
  controller.getTopUpById.bind(controller)
);

/**
 * @route   PUT /api/admin/payments/topups/:id/approve
 * @desc    Approve a top-up
 * @access  Super Admin Only
 */
router.put(
  '/topups/:id/approve',
  requireRole(...PAYMENT_APPROVER_ROLES),
  validate(approveTopUpSchema),
  controller.approveTopUp.bind(controller)
);

// ============================================
// Member Payment Options Routes
// ============================================

/**
 * @route   GET /api/admin/payments/members/:memberId/options
 * @desc    Get payment options for a member
 * @access  Admin
 */
router.get(
  '/members/:memberId/options',
  requireRole(...PAYMENT_VIEWER_ROLES),
  validate(getMemberPaymentOptionsSchema),
  controller.getMemberPaymentOptions.bind(controller)
);

/**
 * @route   PUT /api/admin/payments/members/:memberId/options
 * @desc    Update payment options for a member
 * @access  Admin
 */
router.put(
  '/members/:memberId/options',
  requireRole(...PAYMENT_PROCESSOR_ROLES),
  validate(updateMemberPaymentOptionsSchema),
  controller.updateMemberPaymentOptions.bind(controller)
);

// ============================================
// Reconciliation Routes
// ============================================

/**
 * @route   POST /api/admin/payments/reconciliation/run
 * @desc    Run a new reconciliation
 * @access  Admin
 */
router.post(
  '/reconciliation/run',
  requireRole(...PAYMENT_RECONCILER_ROLES),
  validate(runReconciliationSchema),
  controller.runReconciliation.bind(controller)
);

/**
 * @route   GET /api/admin/payments/reconciliation
 * @desc    List all reconciliation runs
 * @access  Admin
 */
router.get(
  '/reconciliation',
  requireRole(...PAYMENT_VIEWER_ROLES),
  validate(getReconciliationsSchema),
  controller.getReconciliations.bind(controller)
);

/**
 * @route   GET /api/admin/payments/reconciliation/:id
 * @desc    Get reconciliation details
 * @access  Admin
 */
router.get(
  '/reconciliation/:id',
  requireRole(...PAYMENT_VIEWER_ROLES),
  validate(getReconciliationByIdSchema),
  controller.getReconciliationById.bind(controller)
);

// ============================================
// Report Routes
// ============================================

/**
 * @route   POST /api/admin/payments/reports
 * @desc    Generate a payment report
 * @access  Admin
 */
router.post(
  '/reports',
  requireRole(...REPORT_VIEWER_ROLES),
  validate(generateReportSchema),
  controller.generateReport.bind(controller)
);

// ============================================
// Audit Log Routes
// ============================================

/**
 * @route   GET /api/admin/payments/audit-logs
 * @desc    Get payment audit logs
 * @access  Super Admin Only
 */
router.get(
  '/audit-logs',
  requireRole(...AUDIT_VIEWER_ROLES),
  validate(getAuditLogsSchema),
  controller.getAuditLogs.bind(controller)
);

export default router;
