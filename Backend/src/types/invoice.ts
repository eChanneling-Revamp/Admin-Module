import { InvoiceStatus } from '@prisma/client';

export interface CreateInvoiceRequest {
  branchId: string;
  amount: number;
  dueDate?: Date;
  description?: string;
}

export interface UpdateInvoiceRequest {
  amount?: number;
  status?: InvoiceStatus;
  dueDate?: Date;
  description?: string;
}

export interface InvoiceResponse {
  id: string;
  invoiceNo: string;
  branchId: string;
  branch: {
    id: string;
    name: string;
    code: string;
  };
  amount: number;
  status: InvoiceStatus;
  dueDate?: Date;
  paidAt?: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
  branchId?: string;
  minAmount?: number;
  maxAmount?: number;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  sortBy?: 'amount' | 'createdAt' | 'dueDate' | 'paidAt';
  sortOrder?: 'asc' | 'desc';
}

export interface InvoiceStats {
  total: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  byStatus: Record<InvoiceStatus, number>;
  byBranch: Array<{
    branchId: string;
    branchName: string;
    count: number;
    totalAmount: number;
  }>;
}

export interface PaymentRequest {
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
}
