import { prisma } from '../config/database';
import { logger } from '../config/logger';

export class HospitalService {
  async getAllHospitals(): Promise<any[]> {
    try {
      logger.info('Starting to fetch all hospitals from database');
      
      const hospitals = await prisma.hospital.findMany({
        where: { 
          isActive: true 
        },
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          district: true,
          contactNumber: true,
          email: true,
          website: true,
          facilities: true,
          isActive: true,
          createdAt: true,
          status: true,
          profileImage: true
        }
      });

      logger.info(`Found ${hospitals.length} hospitals in database`);
      
      return hospitals;
    } catch (error) {
      logger.error('Error fetching hospitals:', error);
      return [];
    }
  }

  async getHospitalById(id: string): Promise<any | null> {
    try {
      const hospital = await prisma.hospital.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          district: true,
          contactNumber: true,
          email: true,
          website: true,
          facilities: true,
          isActive: true,
          createdAt: true,
          status: true,
          profileImage: true
        }
      });

      if (!hospital) return null;
      return hospital;
    } catch (error) {
      logger.error('Error fetching hospital:', error);
      return null;
    }
  }

  async createHospital(data: any): Promise<any> {
    try {
      const hospital = await prisma.hospital.create({
        data: {
          name: data.name,
          email: data.email,
          address: data.address,
          city: data.city,
          district: data.district,
          contactNumber: data.contactNumber,
          website: data.website,
          facilities: data.facilities || [],
          isActive: true,
          status: 'PENDING',
          profileImage: data.profileImage || null
        },
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          district: true,
          contactNumber: true,
          email: true,
          website: true,
          facilities: true,
          isActive: true,
          createdAt: true,
          status: true,
          profileImage: true
        }
      });

      return hospital;
    } catch (error) {
      logger.error('Error creating hospital:', error);
      throw error;
    }
  }

  async updateHospital(id: string, data: any): Promise<any | null> {
    try {
      const hospital = await prisma.hospital.update({
        where: { id },
        data: {
          name: data.name,
          address: data.address,
          city: data.city,
          district: data.district,
          contactNumber: data.contactNumber,
          website: data.website,
          facilities: data.facilities,
          isActive: data.isActive,
          status: data.status,
          profileImage: data.profileImage
        },
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          district: true,
          contactNumber: true,
          email: true,
          website: true,
          facilities: true,
          isActive: true,
          createdAt: true,
          status: true,
          profileImage: true
        }
      });

      return hospital;
    } catch (error) {
      logger.error('Error updating hospital:', error);
      return null;
    }
  }

  async deleteHospital(id: string): Promise<boolean> {
    try {
      await prisma.hospital.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      logger.error('Error deleting hospital:', error);
      return false;
    }
  }

  async getHospitalStats(): Promise<any> {
    try {
      const [total, active, inactive, approved, pending] = await Promise.all([
        prisma.hospital.count(),
        prisma.hospital.count({ where: { isActive: true } }),
        prisma.hospital.count({ where: { isActive: false } }),
        prisma.hospital.count({ where: { status: 'APPROVED' } }),
        prisma.hospital.count({ where: { status: 'PENDING' } })
      ]);

      return {
        total,
        active,
        inactive,
        approved,
        pending
      };
    } catch (error) {
      logger.error('Error fetching hospital stats:', error);
      return { total: 0, active: 0, inactive: 0, approved: 0, pending: 0 };
    }
  }

  async getHospitalsByCity(city: string): Promise<any[]> {
    try {
      const hospitals = await prisma.hospital.findMany({
        where: { 
          city: city,
          isActive: true 
        },
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          district: true,
          contactNumber: true,
          email: true,
          website: true,
          facilities: true,
          isActive: true,
          createdAt: true,
          status: true,
          profileImage: true
        }
      });

      return hospitals;
    } catch (error) {
      logger.error('Error fetching hospitals by city:', error);
      return [];
    }
  }
}

export default new HospitalService();
