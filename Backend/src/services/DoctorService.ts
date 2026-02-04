import { prisma } from '../config/database';
import { logger } from '../config/logger';

export class DoctorService {
  async getAllDoctors(): Promise<any[]> {
    try {
      logger.info('Starting to fetch all doctors from database');
      
      const doctors = await prisma.doctor.findMany({
        where: { 
          isActive: true 
        },
        select: {
          id: true,
          name: true,
          email: true,
          specialization: true,
          qualification: true,
          experience: true,
          phonenumber: true,
          consultationFee: true,
          rating: true,
          profileImage: true,
          description: true,
          languages: true,
          availableDays: true,
          isActive: true,
          createdAt: true,
          status: true
        }
      });

      logger.info(`Found ${doctors.length} doctors in database`);
      
      // Transform phonenumber to phoneNumber for frontend compatibility
      return doctors.map((doctor: any) => ({
        ...doctor,
        phoneNumber: doctor.phonenumber
      }));
    } catch (error) {
      logger.error('Error fetching doctors:', error);
      return [];
    }
  }

  async getDoctorById(id: string): Promise<any | null> {
    try {
      const doctor = await prisma.doctor.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          specialization: true,
          qualification: true,
          experience: true,
          phonenumber: true,
          consultationFee: true,
          rating: true,
          profileImage: true,
          description: true,
          languages: true,
          availableDays: true,
          isActive: true,
          createdAt: true,
          status: true
        }
      });

      if (!doctor) return null;

      return {
        ...doctor,
        phoneNumber: doctor.phonenumber
      };
    } catch (error) {
      logger.error('Error fetching doctor:', error);
      return null;
    }
  }

  async createDoctor(data: any): Promise<any> {
    try {
      const doctor = await prisma.doctor.create({
        data: {
          name: data.name,
          email: data.email,
          specialization: data.specialization || 'General Medicine',
          qualification: data.qualification || 'MBBS',
          experience: data.experience || 0,
          phonenumber: data.phoneNumber || '+94700000000',
          consultationFee: data.consultationFee || 1500.00,
          rating: 0,
          profileImage: data.profileImage || null,
          description: data.description || '',
          languages: data.languages || ['English'],
          availableDays: data.availableDays || ['Monday'],
          isActive: true,
          status: 'PENDING'
        },
        select: {
          id: true,
          name: true,
          email: true,
          specialization: true,
          qualification: true,
          experience: true,
          phonenumber: true,
          consultationFee: true,
          rating: true,
          profileImage: true,
          description: true,
          languages: true,
          availableDays: true,
          isActive: true,
          createdAt: true,
          status: true
        }
      });

      return {
        ...doctor,
        phoneNumber: doctor.phonenumber
      };
    } catch (error) {
      logger.error('Error creating doctor:', error);
      throw error;
    }
  }

  async updateDoctor(id: string, data: any): Promise<any | null> {
    try {
      const doctor = await prisma.doctor.update({
        where: { id },
        data: {
          name: data.name,
          specialization: data.specialization,
          qualification: data.qualification,
          experience: data.experience,
          phonenumber: data.phoneNumber,
          consultationFee: data.consultationFee,
          rating: data.rating,
          profileImage: data.profileImage,
          description: data.description,
          languages: data.languages,
          availableDays: data.availableDays,
          isActive: data.isActive,
          status: data.status
        },
        select: {
          id: true,
          name: true,
          email: true,
          specialization: true,
          qualification: true,
          experience: true,
          phonenumber: true,
          consultationFee: true,
          rating: true,
          profileImage: true,
          description: true,
          languages: true,
          availableDays: true,
          isActive: true,
          createdAt: true,
          status: true
        }
      });

      return {
        ...doctor,
        phoneNumber: doctor.phonenumber
      };
    } catch (error) {
      logger.error('Error updating doctor:', error);
      return null;
    }
  }

  async deleteDoctor(id: string): Promise<boolean> {
    try {
      await prisma.doctor.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      logger.error('Error deleting doctor:', error);
      return false;
    }
  }

  async getDoctorStats(): Promise<any> {
    try {
      const [total, active, inactive, approved, pending] = await Promise.all([
        prisma.doctor.count(),
        prisma.doctor.count({ where: { isActive: true } }),
        prisma.doctor.count({ where: { isActive: false } }),
        prisma.doctor.count({ where: { status: 'APPROVED' } }),
        prisma.doctor.count({ where: { status: 'PENDING' } })
      ]);

      return {
        total,
        active,
        inactive,
        approved,
        pending
      };
    } catch (error) {
      logger.error('Error fetching doctor stats:', error);
      return { total: 0, active: 0, inactive: 0, approved: 0, pending: 0 };
    }
  }
}

export default new DoctorService();
