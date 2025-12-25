import { InvoiceStatus } from '@prisma/client';
import { InvoiceRepository } from '../repositories/InvoiceRepository';
import { BranchRepository } from '../repositories/BranchRepository';
import { AuditService } from './AuditService';
import { EmailService } from './EmailService';
import { sendMessage, TOPICS } from '../config/kafka';
import { logger } from '../config/logger';
import {
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceResponse,
  InvoiceListQuery,
  InvoiceStats,
  PaymentRequest,
} from '../types/invoice';

export class InvoiceService {
  private invoiceRepository = new InvoiceRepository();
  private branchRepository = new BranchRepository();
  private auditService = new AuditService();
  private emailService = new EmailService();

  async createInvoice(
    invoiceData: CreateInvoiceRequest,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<InvoiceResponse> {
    // Check if branch exists
    const branch = await this.branchRepository.findById(invoiceData.branchId);
    if (!branch) {
      throw new Error('Branch not found');
    }

    // Generate invoice number
    const invoiceNo = await this.invoiceRepository.generateInvoiceNo();

    // Create invoice
    const invoice = await this.invoiceRepository.create({
      invoiceNo,
      branch: {
        connect: { id: invoiceData.branchId }
      },
      amount: invoiceData.amount,
      dueDate: invoiceData.dueDate,
      description: invoiceData.description,
    });

    // Log audit
    if (userId) {
      await this.auditService.log({
        userId,
        action: 'INVOICE_CREATE',
        resource: 'invoice',
        resourceId: invoice.id,
        description: `Created invoice: ${invoice.invoiceNo}`,
        metadata: {
          invoiceNo: invoice.invoiceNo,
          amount: invoice.amount,
          branchName: branch.name,
        },
        ipAddress,
        userAgent,
      });
    }

    // Send Kafka message
    try {
      await sendMessage(TOPICS.INVOICE_CREATED, {
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        amount: invoice.amount,
        branchId: invoice.branchId,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Failed to send Kafka message:', error);
    }

    return {
      id: invoice.id,
      invoiceNo: invoice.invoiceNo,
      branchId: invoice.branchId,
      branch: {
        id: (invoice as any).branch?.id || invoice.branchId,
        name: (invoice as any).branch?.name || '',
        code: (invoice as any).branch?.code || '',
      },
      amount: Number(invoice.amount),
      status: invoice.status,
      dueDate: invoice.dueDate || undefined,
      paidAt: invoice.paidAt || undefined,
      description: invoice.description || undefined,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }

  async getInvoiceById(id: string): Promise<InvoiceResponse> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return {
      id: invoice.id,
      invoiceNo: invoice.invoiceNo,
      branchId: invoice.branchId,
      branch: {
        id: (invoice as any).branch?.id || invoice.branchId,
        name: (invoice as any).branch?.name || '',
        code: (invoice as any).branch?.code || '',
      },
      amount: Number(invoice.amount),
      status: invoice.status,
      dueDate: invoice.dueDate || undefined,
      paidAt: invoice.paidAt || undefined,
      description: invoice.description || undefined,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }

  async getInvoices(query: InvoiceListQuery) {
    const result = await this.invoiceRepository.findMany(query);
    
    return {
      invoices: result.invoices.map(invoice => ({
        id: invoice.id,
        invoiceNo: invoice.invoiceNo,
        branchId: invoice.branchId,
        branch: {
        id: (invoice as any).branch?.id || invoice.branchId,
        name: (invoice as any).branch?.name || '',
        code: (invoice as any).branch?.code || '',
      },
        amount: Number(invoice.amount),
        status: invoice.status,
        dueDate: invoice.dueDate,
        paidAt: invoice.paidAt,
        description: invoice.description,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
      })),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  async updateInvoice(
    id: string,
    updateData: UpdateInvoiceRequest,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<InvoiceResponse> {
    // Check if invoice exists
    const existingInvoice = await this.invoiceRepository.findById(id);
    if (!existingInvoice) {
      throw new Error('Invoice not found');
    }

    // Update invoice
    const invoice = await this.invoiceRepository.update(id, updateData);

    // Log audit
    if (userId) {
      await this.auditService.log({
        userId,
        action: 'INVOICE_UPDATE',
        resource: 'invoice',
        resourceId: invoice.id,
        description: `Updated invoice: ${invoice.invoiceNo}`,
        metadata: {
          invoiceNo: invoice.invoiceNo,
          changes: updateData,
        },
        ipAddress,
        userAgent,
      });
    }

    // Send Kafka message
    try {
      await sendMessage(TOPICS.INVOICE_UPDATED, {
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        status: invoice.status,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Failed to send Kafka message:', error);
    }

    return {
      id: invoice.id,
      invoiceNo: invoice.invoiceNo,
      branchId: invoice.branchId,
      branch: {
        id: (invoice as any).branch?.id || invoice.branchId,
        name: (invoice as any).branch?.name || '',
        code: (invoice as any).branch?.code || '',
      },
      amount: Number(invoice.amount),
      status: invoice.status,
      dueDate: invoice.dueDate || undefined,
      paidAt: invoice.paidAt || undefined,
      description: invoice.description || undefined,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }

  async deleteInvoice(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    // Check if invoice exists
    const existingInvoice = await this.invoiceRepository.findById(id);
    if (!existingInvoice) {
      throw new Error('Invoice not found');
    }

    // Delete invoice
    await this.invoiceRepository.delete(id);

    // Log audit
    if (userId) {
      await this.auditService.log({
        userId,
        action: 'INVOICE_DELETE',
        resource: 'invoice',
        resourceId: id,
        description: `Deleted invoice: ${existingInvoice.invoiceNo}`,
        metadata: {
          invoiceNo: existingInvoice.invoiceNo,
          amount: Number(existingInvoice.amount),
        },
        ipAddress,
        userAgent,
      });
    }
  }

  async processPayment(
    paymentData: PaymentRequest,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<InvoiceResponse> {
    const { invoiceId, amount, paymentMethod, notes } = paymentData;

    // Get invoice
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error('Invoice is already paid');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new Error('Cannot process payment for cancelled invoice');
    }

    // Check if payment amount matches invoice amount
    if (Number(invoice.amount) !== amount) {
      throw new Error('Payment amount does not match invoice amount');
    }

    // Mark invoice as paid
    const updatedInvoice = await this.invoiceRepository.markAsPaid(invoiceId);

    // Log audit
    if (userId) {
      await this.auditService.log({
        userId,
        action: 'INVOICE_PAY',
        resource: 'invoice',
        resourceId: invoiceId,
        description: `Processed payment for invoice: ${invoice.invoiceNo}`,
        metadata: {
          invoiceNo: invoice.invoiceNo,
          amount: amount,
          paymentMethod,
          notes,
        },
        ipAddress,
        userAgent,
      });
    }

    // Send Kafka message
    try {
      await sendMessage(TOPICS.INVOICE_PAID, {
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        amount: amount,
        paymentMethod,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Failed to send Kafka message:', error);
    }

    return {
      id: updatedInvoice.id,
      invoiceNo: updatedInvoice.invoiceNo,
      branchId: updatedInvoice.branchId,
      branch: {
        id: (updatedInvoice as any).branch?.id || '',
        name: (updatedInvoice as any).branch?.name || '',
        code: (updatedInvoice as any).branch?.code || '',
      },
      amount: Number(updatedInvoice.amount),
      status: updatedInvoice.status,
      dueDate: updatedInvoice.dueDate || undefined,
      paidAt: updatedInvoice.paidAt || undefined,
      description: updatedInvoice.description || undefined,
      createdAt: updatedInvoice.createdAt,
      updatedAt: updatedInvoice.updatedAt,
    };
  }

  async getInvoiceStats(): Promise<InvoiceStats> {
    return this.invoiceRepository.getStats();
  }

  async getOverdueInvoices(): Promise<InvoiceResponse[]> {
    const invoices = await this.invoiceRepository.findOverdueInvoices();
    return invoices.map(invoice => ({
      id: invoice.id,
      invoiceNo: invoice.invoiceNo,
      branchId: invoice.branchId,
      branch: {
        id: (invoice as any).branch.id,
        name: (invoice as any).branch.name,
        code: (invoice as any).branch.code,
      },
      amount: Number(invoice.amount),
      status: invoice.status,
      dueDate: invoice.dueDate || undefined,
      paidAt: invoice.paidAt || undefined,
      description: invoice.description || undefined,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    }));
  }

  async getInvoicesByBranch(branchId: string): Promise<InvoiceResponse[]> {
    const invoices = await this.invoiceRepository.findInvoicesByBranch(branchId);
    return invoices.map(invoice => ({
      id: invoice.id,
      invoiceNo: invoice.invoiceNo,
      branchId: invoice.branchId,
      branch: {
        id: (invoice as any).branch.id,
        name: (invoice as any).branch.name,
        code: (invoice as any).branch.code,
      },
      amount: Number(invoice.amount),
      status: invoice.status,
      dueDate: invoice.dueDate || undefined,
      paidAt: invoice.paidAt || undefined,
      description: invoice.description || undefined,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    }));
  }

  async sendInvoiceNotification(invoiceId: string): Promise<void> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Convert to InvoiceResponse for email service
    const invoiceResponse: InvoiceResponse = {
      id: invoice.id,
      invoiceNo: invoice.invoiceNo,
      branchId: invoice.branchId,
      branch: {
        id: (invoice as any).branch.id,
        name: (invoice as any).branch.name,
        code: (invoice as any).branch.code,
      },
      amount: Number(invoice.amount),
      status: invoice.status,
      dueDate: invoice.dueDate || undefined,
      paidAt: invoice.paidAt || undefined,
      description: invoice.description || undefined,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };

    // Send email notification
    await this.emailService.sendInvoiceNotification(invoiceResponse);
  }

  async markOverdueInvoices(): Promise<number> {
    const overdueInvoices = await this.invoiceRepository.findOverdueInvoices();
    let updatedCount = 0;

    for (const invoice of overdueInvoices) {
      await this.invoiceRepository.update(invoice.id, {
        status: InvoiceStatus.OVERDUE,
      });
      updatedCount++;
    }

    return updatedCount;
  }
}

export default new InvoiceService();
