import { BranchService } from '../services/BranchService';
import { prisma } from '../setup';
import { BranchType } from '@prisma/client';

describe('BranchService', () => {
  let branchService: BranchService;

  beforeEach(() => {
    branchService = new BranchService();
  });

  describe('createBranch', () => {
    it('should create a new branch successfully', async () => {
      const branchData = {
        name: 'Test Hospital',
        code: 'TH001',
        city: 'Colombo',
        district: 'Colombo',
        province: 'Western',
        type: BranchType.HOSPITAL,
        address: '123 Test Street',
        phone: '+94 11 234 5678',
        email: 'test@hospital.com',
        description: 'Test hospital description',
      };

      const result = await branchService.createBranch(branchData);

      expect(result).toBeDefined();
      expect(result.name).toBe(branchData.name);
      expect(result.code).toBe(branchData.code);
      expect(result.city).toBe(branchData.city);
      expect(result.district).toBe(branchData.district);
      expect(result.province).toBe(branchData.province);
      expect(result.type).toBe(branchData.type);
      expect(result.address).toBe(branchData.address);
      expect(result.phone).toBe(branchData.phone);
      expect(result.email).toBe(branchData.email);
      expect(result.description).toBe(branchData.description);
      expect(result.status).toBe(true); // Default status
    });

    it('should throw error if branch code already exists', async () => {
      const branchData1 = {
        name: 'Test Hospital 1',
        code: 'TH001',
        city: 'Colombo',
        district: 'Colombo',
        province: 'Western',
        type: BranchType.HOSPITAL,
      };

      const branchData2 = {
        name: 'Test Hospital 2',
        code: 'TH001', // Same code
        city: 'Kandy',
        district: 'Kandy',
        province: 'Central',
        type: BranchType.HOSPITAL,
      };

      // Create first branch
      await branchService.createBranch(branchData1);

      // Try to create second branch with same code
      await expect(branchService.createBranch(branchData2)).rejects.toThrow('Branch code already exists');
    });
  });

  describe('getBranchById', () => {
    let branchId: string;

    beforeEach(async () => {
      const branchData = {
        name: 'Test Hospital',
        code: 'TH001',
        city: 'Colombo',
        district: 'Colombo',
        province: 'Western',
        type: BranchType.HOSPITAL,
      };

      const result = await branchService.createBranch(branchData);
      branchId = result.id;
    });

    it('should get branch by id successfully', async () => {
      const result = await branchService.getBranchById(branchId);

      expect(result).toBeDefined();
      expect(result.id).toBe(branchId);
      expect(result.name).toBe('Test Hospital');
    });

    it('should throw error if branch not found', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(branchService.getBranchById(nonExistentId)).rejects.toThrow('Branch not found');
    });
  });

  describe('updateBranch', () => {
    let branchId: string;

    beforeEach(async () => {
      const branchData = {
        name: 'Test Hospital',
        code: 'TH001',
        city: 'Colombo',
        district: 'Colombo',
        province: 'Western',
        type: BranchType.HOSPITAL,
      };

      const result = await branchService.createBranch(branchData);
      branchId = result.id;
    });

    it('should update branch successfully', async () => {
      const updateData = {
        name: 'Updated Hospital',
        phone: '+94 11 999 9999',
        email: 'updated@hospital.com',
      };

      const result = await branchService.updateBranch(branchId, updateData);

      expect(result).toBeDefined();
      expect(result.name).toBe(updateData.name);
      expect(result.phone).toBe(updateData.phone);
      expect(result.email).toBe(updateData.email);
    });

    it('should throw error if branch not found', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const updateData = { name: 'Updated Hospital' };

      await expect(branchService.updateBranch(nonExistentId, updateData)).rejects.toThrow('Branch not found');
    });
  });

  describe('deleteBranch', () => {
    let branchId: string;

    beforeEach(async () => {
      const branchData = {
        name: 'Test Hospital',
        code: 'TH001',
        city: 'Colombo',
        district: 'Colombo',
        province: 'Western',
        type: BranchType.HOSPITAL,
      };

      const result = await branchService.createBranch(branchData);
      branchId = result.id;
    });

    it('should delete branch successfully', async () => {
      await expect(branchService.deleteBranch(branchId)).resolves.not.toThrow();

      // Verify branch is deleted
      await expect(branchService.getBranchById(branchId)).rejects.toThrow('Branch not found');
    });

    it('should throw error if branch not found', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(branchService.deleteBranch(nonExistentId)).rejects.toThrow('Branch not found');
    });
  });

  describe('getBranchStats', () => {
    beforeEach(async () => {
      // Create test branches
      const branches = [
        {
          name: 'Hospital 1',
          code: 'H001',
          city: 'Colombo',
          district: 'Colombo',
          province: 'Western',
          type: BranchType.HOSPITAL,
        },
        {
          name: 'Clinic 1',
          code: 'C001',
          city: 'Kandy',
          district: 'Kandy',
          province: 'Central',
          type: BranchType.CLINIC,
        },
        {
          name: 'Lab 1',
          code: 'L001',
          city: 'Galle',
          district: 'Galle',
          province: 'Southern',
          type: BranchType.LABORATORY,
        },
      ];

      for (const branchData of branches) {
        await branchService.createBranch(branchData);
      }
    });

    it('should return branch statistics', async () => {
      const result = await branchService.getBranchStats();

      expect(result).toBeDefined();
      expect(result.total).toBe(3);
      expect(result.active).toBe(3);
      expect(result.inactive).toBe(0);
      expect(result.byType).toBeDefined();
      expect(result.byType[BranchType.HOSPITAL]).toBe(1);
      expect(result.byType[BranchType.CLINIC]).toBe(1);
      expect(result.byType[BranchType.LABORATORY]).toBe(1);
    });
  });
});
