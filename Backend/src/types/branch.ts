import { BranchType } from '@prisma/client';

export interface CreateBranchRequest {
  name: string;
  code: string;
  city: string;
  district: string;
  province: string;
  type: BranchType;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
}

export interface UpdateBranchRequest {
  name?: string;
  code?: string;
  city?: string;
  district?: string;
  province?: string;
  type?: BranchType;
  status?: boolean;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
}

export interface BranchResponse {
  id: string;
  name: string;
  code: string;
  city: string;
  district: string;
  province: string;
  type: BranchType;
  status: boolean;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchListQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: BranchType;
  status?: boolean;
  city?: string;
  district?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface BranchStats {
  total: number;
  active: number;
  inactive: number;
  byType: Record<BranchType, number>;
  byCity: Record<string, number>;
}
