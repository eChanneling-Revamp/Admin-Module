import { Prisma, Invoice, InvoiceStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { InvoiceListQuery, InvoiceStats } from '../types/invoice';

export class InvoiceRepository {
  async create(data: Prisma.InvoiceCreateInput): Promise<Invoice> {
    return prisma.invoice.create({
      data,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Invoice | null> {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async findByInvoiceNo(invoiceNo: string): Promise<Invoice | null> {
    return prisma.invoice.findUnique({
      where: { invoiceNo },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async findMany(query: InvoiceListQuery) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      branchId,
      minAmount,
      maxAmount,
      dueDateFrom,
      dueDateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Prisma.InvoiceWhereInput = {};

    if (search) {
      where.OR = [
        { invoiceNo: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          branch: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (branchId) {
      where.branchId = branchId;
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) {
        where.amount.gte = minAmount;
      }
      if (maxAmount !== undefined) {
        where.amount.lte = maxAmount;
      }
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) {
        where.dueDate.gte = dueDateFrom;
      }
      if (dueDateTo) {
        where.dueDate.lte = dueDateTo;
      }
    }

    // Build orderBy clause
    const orderBy: Prisma.InvoiceOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: Prisma.InvoiceUpdateInput): Promise<Invoice> {
    return prisma.invoice.update({
      where: { id },
      data,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Invoice> {
    return prisma.invoice.delete({
      where: { id },
    });
  }

  async markAsPaid(id: string): Promise<Invoice> {
    return prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async getStats(): Promise<InvoiceStats> {
    const [
      total,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      byStatus,
      byBranch,
    ] = await Promise.all([
      prisma.invoice.count(),
      prisma.invoice.aggregate({
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        where: { status: InvoiceStatus.PAID },
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        where: { status: InvoiceStatus.PENDING },
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        where: {
          status: InvoiceStatus.OVERDUE,
        },
        _sum: { amount: true },
      }),
      prisma.invoice.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.invoice.groupBy({
        by: ['branchId'],
        _sum: { amount: true },
        _count: { branchId: true },
      }),
    ]);

    const statusStats = byStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<InvoiceStatus, number>);

    // Get branch names for byBranch stats
    const branchIds = byBranch.map(item => item.branchId);
    const branches = await prisma.branch.findMany({
      where: { id: { in: branchIds } },
      select: { id: true, name: true },
    });

    const branchMap = branches.reduce((acc, branch) => {
      acc[branch.id] = branch.name;
      return acc;
    }, {} as Record<string, string>);

    const branchStats = byBranch.map(item => ({
      branchId: item.branchId,
      branchName: branchMap[item.branchId] || 'Unknown',
      count: item._count.branchId,
      totalAmount: Number(item._sum.amount || 0),
    }));

    return {
      total,
      totalAmount: Number(totalAmount._sum.amount || 0),
      paidAmount: Number(paidAmount._sum.amount || 0),
      pendingAmount: Number(pendingAmount._sum.amount || 0),
      overdueAmount: Number(overdueAmount._sum.amount || 0),
      byStatus: statusStats,
      byBranch: branchStats,
    };
  }

  async exists(id: string): Promise<boolean> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!invoice;
  }

  async existsByInvoiceNo(invoiceNo: string): Promise<boolean> {
    const invoice = await prisma.invoice.findUnique({
      where: { invoiceNo },
      select: { id: true },
    });
    return !!invoice;
  }

  async findOverdueInvoices(): Promise<Invoice[]> {
    const today = new Date();
    return prisma.invoice.findMany({
      where: {
        status: InvoiceStatus.PENDING,
        dueDate: {
          lt: today,
        },
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async findInvoicesByBranch(branchId: string): Promise<Invoice[]> {
    return prisma.invoice.findMany({
      where: { branchId },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateInvoiceNo(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const prefix = `INV-${year}${month}${day}`;
    
    // Find the last invoice number for today
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        invoiceNo: {
          startsWith: prefix,
        },
      },
      orderBy: { invoiceNo: 'desc' },
      select: { invoiceNo: true },
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNo.split('-')[1].slice(8));
      sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }
}

export default new InvoiceRepository();
