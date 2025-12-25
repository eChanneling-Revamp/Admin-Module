import { Prisma, Branch, BranchType } from '@prisma/client';
import { prisma } from '../config/database';
import { BranchListQuery, BranchStats } from '../types/branch';

export class BranchRepository {
  async create(data: Prisma.BranchCreateInput): Promise<Branch> {
    return prisma.branch.create({
      data,
    });
  }

  async findById(id: string): Promise<Branch | null> {
    return prisma.branch.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string): Promise<Branch | null> {
    return prisma.branch.findUnique({
      where: { code },
    });
  }

  async findMany(query: BranchListQuery) {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      city,
      district,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Prisma.BranchWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (typeof status === 'boolean') {
      where.status = status;
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (district) {
      where.district = { contains: district, mode: 'insensitive' };
    }

    // Build orderBy clause
    const orderBy: Prisma.BranchOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    const [branches, total] = await Promise.all([
      prisma.branch.findMany({
        where,
        skip,
        take,
        orderBy,
      }),
      prisma.branch.count({ where }),
    ]);

    return {
      branches,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: Prisma.BranchUpdateInput): Promise<Branch> {
    return prisma.branch.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Branch> {
    return prisma.branch.delete({
      where: { id },
    });
  }

  async getStats(): Promise<BranchStats> {
    const [
      total,
      active,
      inactive,
      byType,
      byCity,
    ] = await Promise.all([
      prisma.branch.count(),
      prisma.branch.count({ where: { status: true } }),
      prisma.branch.count({ where: { status: false } }),
      prisma.branch.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
      prisma.branch.groupBy({
        by: ['city'],
        _count: { city: true },
      }),
    ]);

    const typeStats = byType.reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {} as Record<BranchType, number>);

    const cityStats = byCity.reduce((acc, item) => {
      acc[item.city] = item._count.city;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      inactive,
      byType: typeStats,
      byCity: cityStats,
    };
  }

  async exists(id: string): Promise<boolean> {
    const branch = await prisma.branch.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!branch;
  }

  async existsByCode(code: string): Promise<boolean> {
    const branch = await prisma.branch.findUnique({
      where: { code },
      select: { id: true },
    });
    return !!branch;
  }

  async findActiveBranches(): Promise<Branch[]> {
    return prisma.branch.findMany({
      where: { status: true },
      orderBy: { name: 'asc' },
    });
  }

  async findBranchesByCity(city: string): Promise<Branch[]> {
    return prisma.branch.findMany({
      where: {
        city: { contains: city, mode: 'insensitive' },
        status: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBranchesByType(type: BranchType): Promise<Branch[]> {
    return prisma.branch.findMany({
      where: {
        type,
        status: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}

export default new BranchRepository();
