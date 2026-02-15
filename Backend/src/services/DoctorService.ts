import { AppointmentStatus, Prisma, sessionstatus as SessionStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

type DoctorScheduleFilters = {
  startDate?: Date;
  endDate?: Date;
  doctorId?: string;
  hospitalId?: string;
  status?: SessionStatus;
  search?: string;
  page?: number;
  pageSize?: number;
  sortOrder?: Prisma.SortOrder;
};

type DoctorScheduleResult = {
  id: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  hospitalId: string;
  hospitalName: string;
  hospitalCity?: string | null;
  location: string;
  scheduledAt: Date;
  startTime: Date;
  endTime: Date;
  capacity: number;
  booked: number;
  available: number;
  sessionStatus: SessionStatus;
  isFull: boolean;
  consultationFee: number;
};

type DoctorScheduleList = {
  schedules: DoctorScheduleResult[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export class DoctorService {
  async getAllDoctors(): Promise<any[]> {
    try {
      logger.info('Starting to fetch all doctors from database');

      const doctors = await prisma.doctor.findMany({
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
          status: true,
        },
      });

      logger.info(`Found ${doctors.length} doctors in database`);

      return doctors.map((doctor: any) => ({
        ...doctor,
        phoneNumber: doctor.phonenumber,
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
          status: true,
        },
      });

      if (!doctor) {
        return null;
      }

      return {
        ...doctor,
        phoneNumber: doctor.phonenumber,
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
          consultationFee: data.consultationFee || 1500.0,
          rating: 0,
          profileImage: data.profileImage || null,
          description: data.description || '',
          languages: data.languages || ['English'],
          availableDays: data.availableDays || ['Monday'],
          isActive: true,
          status: 'PENDING',
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
          status: true,
        },
      });

      return {
        ...doctor,
        phoneNumber: doctor.phonenumber,
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
          status: data.status,
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
          status: true,
        },
      });

      return {
        ...doctor,
        phoneNumber: doctor.phonenumber,
      };
    } catch (error) {
      logger.error('Error updating doctor:', error);
      return null;
    }
  }

  async updateDoctorStatus(id: string, status: string): Promise<any | null> {
    try {
      const doctor = await prisma.doctor.update({
        where: { id },
        data: { status },
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
          status: true,
        },
      });

      return {
        ...doctor,
        phoneNumber: doctor.phonenumber,
      };
    } catch (error) {
      logger.error('Error updating doctor status:', error);
      return null;
    }
  }

  async deleteDoctor(id: string): Promise<boolean> {
    try {
      await prisma.doctor.delete({
        where: { id },
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
        prisma.doctor.count({ where: { status: 'PENDING' } }),
      ]);

      return {
        total,
        active,
        inactive,
        approved,
        pending,
      };
    } catch (error) {
      logger.error('Error fetching doctor stats:', error);
      return { total: 0, active: 0, inactive: 0, approved: 0, pending: 0 };
    }
  }

  async getDoctorSchedules(filters: DoctorScheduleFilters = {}): Promise<DoctorScheduleList> {
    try {
      const where: Prisma.SessionWhereInput = {};

      const dateFilter: Prisma.DateTimeFilter = {};
      if (filters.startDate) {
        dateFilter.gte = filters.startDate;
      }
      if (filters.endDate) {
        dateFilter.lte = filters.endDate;
      }
      if (Object.keys(dateFilter).length > 0) {
        where.scheduledAt = dateFilter;
      }

      if (filters.doctorId) {
        where.doctorId = filters.doctorId;
      }

      if (filters.hospitalId) {
        where.hospitalId = filters.hospitalId;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.search) {
        const containsFilter = {
          contains: filters.search,
          mode: 'insensitive' as const,
        };

        where.OR = [
          { doctor: { name: containsFilter } },
          { doctor: { specialization: containsFilter } },
          { hospital: { name: containsFilter } },
          { location: containsFilter },
        ];
      }

      const pageSize = Math.min(Math.max(filters.pageSize ?? 50, 1), 200);
      const page = Math.max(filters.page ?? 1, 1);
      const skip = (page - 1) * pageSize;
      const sortOrder = filters.sortOrder === 'desc' ? 'desc' : 'asc';

      const [sessions, total] = await Promise.all([
        prisma.session.findMany({
          where,
          orderBy: { scheduledAt: sortOrder },
          skip,
          take: pageSize,
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
                consultationFee: true,
              },
            },
            hospital: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
            _count: {
              select: {
                appointments: {
                  where: {
                    status: {
                      notIn: [AppointmentStatus.CANCELLED],
                    },
                  },
                },
              },
            },
          },
        }),
        prisma.session.count({ where }),
      ]);

      const schedules = sessions.map((session) => {
        const booked = session._count?.appointments ?? 0;
        const available = Math.max(session.capacity - booked, 0);

        return {
          id: session.id,
          doctorId: session.doctor.id,
          doctorName: session.doctor.name,
          specialization: session.doctor.specialization,
          hospitalId: session.hospital.id,
          hospitalName: session.hospital.name,
          hospitalCity: session.hospital.city,
          location: session.location,
          scheduledAt: session.scheduledAt,
          startTime: session.startTime,
          endTime: session.endTime,
          capacity: session.capacity,
          booked,
          available,
          sessionStatus: session.status,
          isFull: available <= 0,
          consultationFee: Number(session.doctor.consultationFee),
        };
      });

      const totalPages = Math.max(Math.ceil(total / pageSize), 1);

      return {
        schedules,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('Error fetching doctor schedules:', error);
      return {
        schedules: [],
        pagination: {
          page: filters.page ?? 1,
          pageSize: filters.pageSize ?? 50,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }
}

export default new DoctorService();
