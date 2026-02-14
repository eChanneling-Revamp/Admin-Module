import { hospital_status } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

type HospitalGroupHospital = {
  id: string;
  name: string;
  city: string;
  district: string;
  hospitalType: string;
  status: hospital_status;
  doctorCount: number;
  facilities: string[];
  profileImage: string | null;
};

export type HospitalGroupSummary = {
  id: string;
  hospitalType: string;
  totalHospitals: number;
  statusBreakdown: Record<hospital_status, number>;
  hospitals: HospitalGroupHospital[];
  doctorCount: number;
  facilityCount: number;
  cities: string[];
  districts: string[];
  districtCount: number;
};

const STATUS_TEMPLATE: Record<hospital_status, number> = {
  APPROVED: 0,
  PENDING: 0,
  REJECTED: 0,
};

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

  async updateHospitalStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<any | null> {
    try {
      const hospital = await prisma.hospital.update({
        where: { id },
        data: { status },
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
      logger.error('Error updating hospital status:', error);
      return null;
    }
  }

  async updateHospitalFacilities(id: string, facilities: string[]): Promise<any | null> {
    try {
      const hospital = await prisma.hospital.update({
        where: { id },
        data: { facilities },
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
          profileImage: true,
        },
      });

      return hospital;
    } catch (error) {
      logger.error('Error updating hospital facilities:', error);
      return null;
    }
  }

  async getHospitalGroups(): Promise<HospitalGroupSummary[]> {
    try {
      const hospitals = await prisma.hospital.findMany({
        select: {
          id: true,
          name: true,
          city: true,
          district: true,
          hospitalType: true,
          status: true,
          facilities: true,
          profileImage: true,
          _count: {
            select: {
              doctorHospitals: true,
            },
          },
        },
      });

      type TypeAccumulator = {
        data: HospitalGroupSummary;
        citySet: Set<string>;
        districtSet: Set<string>;
        facilitySet: Set<string>;
      };

      const typeGroups = new Map<string, TypeAccumulator>();

      hospitals.forEach((hospital) => {
        const hospitalType = hospital.hospitalType?.trim() || 'Uncategorized';
        const district = hospital.district?.trim() || 'Unknown District';
        const city = hospital.city?.trim() || 'Unknown City';

        if (!typeGroups.has(hospitalType)) {
          typeGroups.set(hospitalType, {
            data: {
              id: hospitalType,
              hospitalType,
              totalHospitals: 0,
              statusBreakdown: { ...STATUS_TEMPLATE },
              hospitals: [],
              doctorCount: 0,
              facilityCount: 0,
              cities: [],
              districts: [],
              districtCount: 0,
            },
            citySet: new Set<string>(),
            districtSet: new Set<string>(),
            facilitySet: new Set<string>(),
          });
        }

        const typeGroup = typeGroups.get(hospitalType)!;
        const { data, citySet, districtSet, facilitySet } = typeGroup;

        data.totalHospitals += 1;
        data.statusBreakdown[hospital.status] += 1;
        data.doctorCount += hospital._count.doctorHospitals;
        citySet.add(city);
        districtSet.add(district);
        hospital.facilities?.forEach((facility) => {
          if (facility) {
            facilitySet.add(facility);
          }
        });

        data.hospitals.push({
          id: hospital.id,
          name: hospital.name,
          city,
          district,
          hospitalType,
          status: hospital.status,
          doctorCount: hospital._count.doctorHospitals,
          facilities: hospital.facilities || [],
          profileImage: hospital.profileImage,
        });
      });

      const formattedGroups = Array.from(typeGroups.values()).map(({ data, citySet, districtSet, facilitySet }) => ({
        ...data,
        cities: Array.from(citySet).sort(),
        districts: Array.from(districtSet).sort(),
        facilityCount: facilitySet.size,
        districtCount: districtSet.size,
        hospitals: data.hospitals.sort((a, b) => a.name.localeCompare(b.name)),
      }));

      return formattedGroups.sort((a, b) => b.totalHospitals - a.totalHospitals);
    } catch (error) {
      logger.error('Error grouping hospitals:', error);
      return [];
    }
  }
}

export default new HospitalService();
