import { BranchType } from '@prisma/client';
import { BranchRepository } from '../repositories/BranchRepository';
import { AuditService } from './AuditService';
import { sendMessage, TOPICS } from '../config/kafka';
import { logger } from '../config/logger';
import {
  CreateBranchRequest,
  UpdateBranchRequest,
  BranchResponse,
  BranchListQuery,
  BranchStats,
} from '../types/branch';

export class BranchService {
  private branchRepository = new BranchRepository();
  private auditService = new AuditService();

  async createBranch(
    branchData: CreateBranchRequest,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<BranchResponse> {
    // Check if branch code already exists
    const existingBranch = await this.branchRepository.findByCode(branchData.code);
    if (existingBranch) {
      throw new Error('Branch code already exists');
    }

    // Create branch
    const branch = await this.branchRepository.create({
      name: branchData.name,
      code: branchData.code,
      city: branchData.city,
      district: branchData.district,
      province: branchData.province,
      type: branchData.type,
      address: branchData.address,
      phone: branchData.phone,
      email: branchData.email,
      description: branchData.description,
    });

    // Log audit
    if (userId) {
      await this.auditService.log({
        userId,
        action: 'BRANCH_CREATE',
        resource: 'branch',
        resourceId: branch.id,
        description: `Created branch: ${branch.name}`,
        metadata: {
          branchName: branch.name,
          branchCode: branch.code,
          branchType: branch.type,
        },
        ipAddress,
        userAgent,
      });
    }

    // Send Kafka message
    try {
      await sendMessage(TOPICS.BRANCH_CREATED, {
        branchId: branch.id,
        name: branch.name,
        code: branch.code,
        type: branch.type,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Failed to send Kafka message:', error);
    }

    return {
      id: branch.id,
      name: branch.name,
      code: branch.code,
      city: branch.city,
      district: branch.district,
      province: branch.province,
      type: branch.type,
      status: branch.status,
      address: branch.address || undefined,
      phone: branch.phone || undefined,
      email: branch.email || undefined,
      description: branch.description || undefined,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
    };
  }

  async getBranchById(id: string): Promise<BranchResponse> {
    const branch = await this.branchRepository.findById(id);
    if (!branch) {
      throw new Error('Branch not found');
    }

    return {
      id: branch.id,
      name: branch.name,
      code: branch.code,
      city: branch.city,
      district: branch.district,
      province: branch.province,
      type: branch.type,
      status: branch.status,
      address: branch.address || undefined,
      phone: branch.phone || undefined,
      email: branch.email || undefined,
      description: branch.description || undefined,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
    };
  }

  async getBranches(query: BranchListQuery) {
    const result = await this.branchRepository.findMany(query);
    
    return {
      branches: result.branches.map(branch => ({
        id: branch.id,
        name: branch.name,
        code: branch.code,
        city: branch.city,
        district: branch.district,
        province: branch.province,
        type: branch.type,
        status: branch.status,
        address: branch.address,
        phone: branch.phone,
        email: branch.email,
        description: branch.description,
        createdAt: branch.createdAt,
        updatedAt: branch.updatedAt,
      })),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  async updateBranch(
    id: string,
    updateData: UpdateBranchRequest,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<BranchResponse> {
    // Check if branch exists
    const existingBranch = await this.branchRepository.findById(id);
    if (!existingBranch) {
      throw new Error('Branch not found');
    }

    // Check if new code conflicts with existing branch
    if (updateData.code && updateData.code !== existingBranch.code) {
      const codeExists = await this.branchRepository.findByCode(updateData.code);
      if (codeExists) {
        throw new Error('Branch code already exists');
      }
    }

    // Update branch
    const branch = await this.branchRepository.update(id, updateData);

    // Log audit
    if (userId) {
      await this.auditService.log({
        userId,
        action: 'BRANCH_UPDATE',
        resource: 'branch',
        resourceId: branch.id,
        description: `Updated branch: ${branch.name}`,
        metadata: {
          branchName: branch.name,
          branchCode: branch.code,
          changes: updateData,
        },
        ipAddress,
        userAgent,
      });
    }

    // Send Kafka message
    try {
      await sendMessage(TOPICS.BRANCH_UPDATED, {
        branchId: branch.id,
        name: branch.name,
        code: branch.code,
        type: branch.type,
        status: branch.status,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Failed to send Kafka message:', error);
    }

    return {
      id: branch.id,
      name: branch.name,
      code: branch.code,
      city: branch.city,
      district: branch.district,
      province: branch.province,
      type: branch.type,
      status: branch.status,
      address: branch.address || undefined,
      phone: branch.phone || undefined,
      email: branch.email || undefined,
      description: branch.description || undefined,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
    };
  }

  async deleteBranch(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    // Check if branch exists
    const existingBranch = await this.branchRepository.findById(id);
    if (!existingBranch) {
      throw new Error('Branch not found');
    }

    // Delete branch
    await this.branchRepository.delete(id);

    // Log audit
    if (userId) {
      await this.auditService.log({
        userId,
        action: 'BRANCH_DELETE',
        resource: 'branch',
        resourceId: id,
        description: `Deleted branch: ${existingBranch.name}`,
        metadata: {
          branchName: existingBranch.name,
          branchCode: existingBranch.code,
        },
        ipAddress,
        userAgent,
      });
    }

    // Send Kafka message
    try {
      await sendMessage(TOPICS.BRANCH_DELETED, {
        branchId: id,
        name: existingBranch.name,
        code: existingBranch.code,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Failed to send Kafka message:', error);
    }
  }

  async getBranchStats(): Promise<BranchStats> {
    return this.branchRepository.getStats();
  }

  async getActiveBranches() {
    const branches = await this.branchRepository.findActiveBranches();
    return branches.map(branch => ({
      id: branch.id,
      name: branch.name,
      code: branch.code,
      city: branch.city,
      district: branch.district,
      province: branch.province,
      type: branch.type,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
    }));
  }

  async getBranchesByCity(city: string) {
    const branches = await this.branchRepository.findBranchesByCity(city);
    return branches.map(branch => ({
      id: branch.id,
      name: branch.name,
      code: branch.code,
      city: branch.city,
      district: branch.district,
      province: branch.province,
      type: branch.type,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
    }));
  }

  async getBranchesByType(type: BranchType) {
    const branches = await this.branchRepository.findBranchesByType(type);
    return branches.map(branch => ({
      id: branch.id,
      name: branch.name,
      code: branch.code,
      city: branch.city,
      district: branch.district,
      province: branch.province,
      type: branch.type,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
    }));
  }

  async toggleBranchStatus(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<BranchResponse> {
    const branch = await this.branchRepository.findById(id);
    if (!branch) {
      throw new Error('Branch not found');
    }

    const updatedBranch = await this.branchRepository.update(id, {
      status: !branch.status,
    });

    // Log audit
    if (userId) {
      await this.auditService.log({
        userId,
        action: 'BRANCH_UPDATE',
        resource: 'branch',
        resourceId: branch.id,
        description: `${updatedBranch.status ? 'Activated' : 'Deactivated'} branch: ${branch.name}`,
        metadata: {
          branchName: branch.name,
          branchCode: branch.code,
          newStatus: updatedBranch.status,
        },
        ipAddress,
        userAgent,
      });
    }

    return {
      id: updatedBranch.id,
      name: updatedBranch.name,
      code: updatedBranch.code,
      city: updatedBranch.city,
      district: updatedBranch.district,
      province: updatedBranch.province,
      type: updatedBranch.type,
      status: updatedBranch.status,
      address: updatedBranch.address || undefined,
      phone: updatedBranch.phone || undefined,
      email: updatedBranch.email || undefined,
      description: updatedBranch.description || undefined,
      createdAt: updatedBranch.createdAt,
      updatedAt: updatedBranch.updatedAt,
    };
  }
}

export default new BranchService();
