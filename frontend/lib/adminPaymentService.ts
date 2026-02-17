/**
 * Admin Payment Service
 * 
 * Frontend API service for admin payment operations including:
 * - Transaction search and monitoring
 * - Refund management
 * - Reversal processing
 * - Member top-ups
 * - Payment reconciliation
 * - Reports and audit logs
 */

// Types
export interface Transaction {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string | null;
  gatewayResponse: Record<string, any> | null;
  status: PaymentStatus;
  paidAt: string | null;
  refundedAt: string | null;
  refundAmount: number | null;
  createdAt: string;
  updatedAt: string;
  appointment?: {
    id: string;
    appointmentNumber: string;
    bookedBy?: { name: string; email: string };
    doctor?: { name: string };
    hospital?: { name: string };
  };
}

export interface RefundRequest {
  id: string;
  requestNumber: string;
  paymentId: string;
  originalTransactionId: string;
  appointmentId: string | null;
  memberId: string | null;
  memberType: string | null;
  originalAmount: number;
  refundAmount: number;
  refundType: RefundType;
  refundMethod: RefundMethod;
  reason: string;
  status: RefundStatus;
  requestedById: string;
  requestedByEmail: string;
  approvedById: string | null;
  approvedByEmail: string | null;
  approvedAt: string | null;
  rejectedById: string | null;
  rejectedByEmail: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  processedById: string | null;
  processedByEmail: string | null;
  processedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReversalRequest {
  id: string;
  requestNumber: string;
  paymentId: string;
  originalTransactionId: string;
  appointmentId: string | null;
  memberId: string | null;
  memberType: string | null;
  originalAmount: number;
  reversalType: ReversalType;
  reason: string;
  status: ReversalStatus;
  requestedById: string;
  requestedByEmail: string;
  processedById: string | null;
  processedByEmail: string | null;
  processedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TopUp {
  id: string;
  topUpNumber: string;
  memberId: string;
  memberType: MemberType;
  memberEmail: string | null;
  memberName: string | null;
  amount: number;
  previousBalance: number;
  newBalance: number;
  topUpMethod: TopUpMethod;
  paymentReference: string | null;
  reason: string;
  status: TopUpStatus;
  processedById: string;
  processedByEmail: string;
  approvedById: string | null;
  approvedByEmail: string | null;
  approvedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Reconciliation {
  id: string;
  reconciliationNumber: string;
  reconciliationDate: string;
  startDate: string;
  endDate: string;
  totalTransactions: number;
  matchedTransactions: number;
  mismatchedTransactions: number;
  incompleteTransactions: number;
  totalAmount: number;
  matchedAmount: number;
  mismatchedAmount: number;
  status: ReconciliationStatus;
  summary: Record<string, any>;
  discrepancies: ReconciliationDiscrepancy[];
  performedById: string;
  performedByEmail: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationDiscrepancy {
  paymentId: string;
  transactionId: string | null;
  expectedStatus: string;
  actualStatus: string;
  expectedAmount?: number;
  actualAmount?: number;
  discrepancyType: string;
  details: string;
}

export interface PaymentStatistics {
  totalTransactions: number;
  totalAmount: number;
  completedAmount: number;
  pendingAmount: number;
  refundedAmount: number;
  byStatus: Record<string, { count: number; amount: number }>;
  byMethod: Record<string, { count: number; amount: number }>;
}

export interface AuditLog {
  id: string;
  actionType: string;
  paymentId: string | null;
  refundRequestId: string | null;
  reversalRequestId: string | null;
  performedById: string;
  performedByEmail: string;
  performedByRole: string;
  previousState: Record<string, any> | null;
  newState: Record<string, any> | null;
  amount: number | null;
  currency: string | null;
  reason: string | null;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface MemberPaymentOption {
  id: string;
  memberId: string;
  memberType: MemberType;
  paymentMethod: string;
  isEnabled: boolean;
  isDefault: boolean;
  maxTransactionLimit: number | null;
  dailyLimit: number | null;
  monthlyLimit: number | null;
  restrictions: Record<string, any> | null;
}

// Enums
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED' | 'UNPAID';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'MOBILE_PAYMENT';
export type RefundStatus = 'REQUESTED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'PROCESSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type RefundType = 'FULL' | 'PARTIAL';
export type RefundMethod = 'ORIGINAL_METHOD' | 'BANK_TRANSFER' | 'CREDIT' | 'CASH' | 'OTHER';
export type ReversalStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type ReversalType = 'APPOINTMENT_CANCELLATION' | 'DUPLICATE_PAYMENT' | 'SYSTEM_ERROR' | 'FRAUD' | 'CHARGEBACK' | 'INCOMPLETE_TRANSACTION' | 'OTHER';
export type MemberType = 'PATIENT' | 'DOCTOR' | 'HOSPITAL' | 'AGENT' | 'CORPORATE';
export type TopUpStatus = 'PENDING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type TopUpMethod = 'BANK_TRANSFER' | 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CHEQUE' | 'INTERNAL_ADJUSTMENT';
export type ReconciliationStatus = 'IN_PROGRESS' | 'COMPLETED' | 'COMPLETED_WITH_DISCREPANCIES' | 'FAILED';

// Query interfaces
export interface TransactionSearchParams {
  searchTerm?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  transactionId?: string;
  patientEmail?: string;
  doctorId?: string;
  hospitalId?: string;
  sortBy?: 'createdAt' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface RefundRequestParams {
  status?: RefundStatus;
  refundType?: RefundType;
  paymentId?: string;
  memberId?: string;
  requestedById?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ReversalRequestParams {
  status?: ReversalStatus;
  reversalType?: ReversalType;
  paymentId?: string;
  memberId?: string;
  requestedById?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TopUpParams {
  status?: TopUpStatus;
  memberId?: string;
  memberType?: MemberType;
  processedById?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ReconciliationParams {
  status?: ReconciliationStatus;
  performedById?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogParams {
  actionType?: string;
  paymentId?: string;
  performedById?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Request DTOs
export interface CreateRefundRequestDTO {
  paymentId: string;
  refundAmount: number;
  refundType: RefundType;
  refundMethod?: RefundMethod;
  reason: string;
  internalNotes?: string;
  idempotencyKey?: string;
}

export interface CreateReversalRequestDTO {
  paymentId: string;
  reversalType: ReversalType;
  reason: string;
  internalNotes?: string;
  idempotencyKey?: string;
}

export interface CreateTopUpDTO {
  memberId: string;
  memberType: MemberType;
  amount: number;
  topUpMethod: TopUpMethod;
  paymentReference?: string;
  reason: string;
  internalNotes?: string;
  idempotencyKey?: string;
}

export interface UpdatePaymentOptionsDTO {
  memberType: MemberType;
  paymentMethod: PaymentMethod;
  isEnabled: boolean;
  isDefault?: boolean;
  maxTransactionLimit?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
  restrictions?: Record<string, any>;
}

export interface RunReconciliationDTO {
  startDate: string;
  endDate: string;
}

export interface GenerateReportDTO {
  reportType: 'DAILY_SUMMARY' | 'WEEKLY_SUMMARY' | 'MONTHLY_SUMMARY' | 'CUSTOM_RANGE' | 'REFUND_REPORT' | 'REVERSAL_REPORT' | 'RECONCILIATION_REPORT';
  startDate: string;
  endDate: string;
  format?: 'JSON' | 'CSV' | 'PDF' | 'EXCEL';
}

// Response types
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// API Client
class AdminPaymentService {
  private baseUrl: string;

  constructor() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    this.baseUrl = `${apiUrl.replace(/\/$/, '')}/api/admin/payments`;
  }

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const query = searchParams.toString();
    return query ? `?${query}` : '';
  }

  // ============================================
  // Transaction Methods
  // ============================================

  async searchTransactions(params: TransactionSearchParams = {}): Promise<PaginatedResponse<Transaction>> {
    return this.request(`/transactions${this.buildQueryString(params)}`);
  }

  async getTransactionById(id: string): Promise<SingleResponse<Transaction>> {
    return this.request(`/transactions/${id}`);
  }

  async getPaymentStatistics(startDate?: string, endDate?: string): Promise<SingleResponse<PaymentStatistics>> {
    return this.request(`/statistics${this.buildQueryString({ startDate, endDate })}`);
  }

  // ============================================
  // Refund Methods
  // ============================================

  async createRefundRequest(data: CreateRefundRequestDTO): Promise<SingleResponse<RefundRequest>> {
    return this.request('/refunds', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRefundRequests(params: RefundRequestParams = {}): Promise<PaginatedResponse<RefundRequest>> {
    return this.request(`/refunds${this.buildQueryString(params)}`);
  }

  async getRefundRequestById(id: string): Promise<SingleResponse<RefundRequest>> {
    return this.request(`/refunds/${id}`);
  }

  async approveRefund(id: string, internalNotes?: string, idempotencyKey?: string): Promise<SingleResponse<RefundRequest>> {
    return this.request(`/refunds/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ internalNotes, idempotencyKey }),
    });
  }

  async rejectRefund(id: string, rejectionReason: string, idempotencyKey?: string): Promise<SingleResponse<RefundRequest>> {
    return this.request(`/refunds/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectionReason, idempotencyKey }),
    });
  }

  async processRefund(id: string, gatewayRefundId?: string, gatewayResponse?: Record<string, any>, idempotencyKey?: string): Promise<SingleResponse<RefundRequest>> {
    return this.request(`/refunds/${id}/process`, {
      method: 'PUT',
      body: JSON.stringify({ gatewayRefundId, gatewayResponse, idempotencyKey }),
    });
  }

  // ============================================
  // Reversal Methods
  // ============================================

  async createReversalRequest(data: CreateReversalRequestDTO): Promise<SingleResponse<ReversalRequest>> {
    return this.request('/reversals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReversalRequests(params: ReversalRequestParams = {}): Promise<PaginatedResponse<ReversalRequest>> {
    return this.request(`/reversals${this.buildQueryString(params)}`);
  }

  async getReversalRequestById(id: string): Promise<SingleResponse<ReversalRequest>> {
    return this.request(`/reversals/${id}`);
  }

  async processReversal(id: string, gatewayReversalId?: string, gatewayResponse?: Record<string, any>, idempotencyKey?: string): Promise<SingleResponse<ReversalRequest>> {
    return this.request(`/reversals/${id}/process`, {
      method: 'PUT',
      body: JSON.stringify({ gatewayReversalId, gatewayResponse, idempotencyKey }),
    });
  }

  // ============================================
  // Top-Up Methods
  // ============================================

  async createTopUp(data: CreateTopUpDTO): Promise<SingleResponse<TopUp>> {
    return this.request('/topups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTopUps(params: TopUpParams = {}): Promise<PaginatedResponse<TopUp>> {
    return this.request(`/topups${this.buildQueryString(params)}`);
  }

  async getTopUpById(id: string): Promise<SingleResponse<TopUp>> {
    return this.request(`/topups/${id}`);
  }

  async approveTopUp(id: string, internalNotes?: string, idempotencyKey?: string): Promise<SingleResponse<TopUp>> {
    return this.request(`/topups/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ internalNotes, idempotencyKey }),
    });
  }

  // ============================================
  // Member Payment Options Methods
  // ============================================

  async getMemberPaymentOptions(memberId: string, memberType: MemberType): Promise<SingleResponse<MemberPaymentOption[]>> {
    return this.request(`/members/${memberId}/options?memberType=${memberType}`);
  }

  async updateMemberPaymentOptions(memberId: string, data: UpdatePaymentOptionsDTO): Promise<SingleResponse<MemberPaymentOption>> {
    return this.request(`/members/${memberId}/options`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ============================================
  // Reconciliation Methods
  // ============================================

  async runReconciliation(data: RunReconciliationDTO): Promise<SingleResponse<Reconciliation>> {
    return this.request('/reconciliation/run', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReconciliations(params: ReconciliationParams = {}): Promise<PaginatedResponse<Reconciliation>> {
    return this.request(`/reconciliation${this.buildQueryString(params)}`);
  }

  async getReconciliationById(id: string): Promise<SingleResponse<Reconciliation>> {
    return this.request(`/reconciliation/${id}`);
  }

  // ============================================
  // Report Methods
  // ============================================

  async generateReport(data: GenerateReportDTO): Promise<SingleResponse<any>> {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============================================
  // Audit Log Methods
  // ============================================

  async getAuditLogs(params: AuditLogParams = {}): Promise<PaginatedResponse<AuditLog>> {
    return this.request(`/audit-logs${this.buildQueryString(params)}`);
  }
}

// Export singleton instance
export const adminPaymentService = new AdminPaymentService();

// Export class for custom instances
export default AdminPaymentService;
