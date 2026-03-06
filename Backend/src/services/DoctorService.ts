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

type HospitalSummary = {
  id: string;
  name: string;
  city: string;
  district: string;
  isActive: boolean;
};

type DoctorHospitalAssignment = {
  doctorId: string;
  doctorName: string;
  specialization: string;
  status: string;
  primaryHospital?: HospitalSummary;
  additionalHospitals: HospitalSummary[];
  weeklySessions: number;
  totalHospitals: number;
};

type DoctorHospitalAssignmentStats = {
  totalAssignments: number;
  multiHospitalDoctors: number;
  activeHospitals: number;
  weeklySessions: number;
};

type DoctorHospitalAssignmentResponse = {
  assignments: DoctorHospitalAssignment[];
  stats: DoctorHospitalAssignmentStats;
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
        data: { status: status as any },
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

  async getDoctorHospitalAssignments(): Promise<DoctorHospitalAssignmentResponse> {
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);

      const [doctors, activeAssignmentCount, activeHospitalIds, weeklySessionGroups] = await Promise.all([
        prisma.doctor.findMany({
          where: {
            doctorHospitals: {
              some: {
                isActive: true,
              },
            },
          },
          select: {
            id: true,
            name: true,
            specialization: true,
            status: true,
            doctorHospitals: {
              where: { isActive: true },
              orderBy: { assignedAt: 'asc' },
              select: {
                hospital: {
                  select: {
                    id: true,
                    name: true,
                    city: true,
                    district: true,
                    isActive: true,
                  },
                },
              },
            },
          },
        }),
        prisma.doctorHospital.count({ where: { isActive: true } }),
        prisma.doctorHospital.findMany({
          where: { isActive: true },
          select: { hospitalId: true },
        }),
        prisma.session.groupBy({
          by: ['doctorId'],
          where: {
            scheduledAt: {
              gte: sevenDaysAgo,
              lte: now,
            },
          },
          _count: {
            _all: true,
          },
        }),
      ]);

      const weeklySessionMap = new Map<string, number>();
      let totalWeeklySessions = 0;

      weeklySessionGroups.forEach((group) => {
        const count = group._count?._all ?? 0;
        weeklySessionMap.set(group.doctorId, count);
        totalWeeklySessions += count;
      });

      const assignments: DoctorHospitalAssignment[] = doctors.map((doctor) => {
        const hospitals: HospitalSummary[] = doctor.doctorHospitals
          .map((assignment) => ({
            id: assignment.hospital.id,
            name: assignment.hospital.name,
            city: assignment.hospital.city,
            district: assignment.hospital.district,
            isActive: assignment.hospital.isActive,
          }));

        const [primaryHospital, ...additionalHospitals] = hospitals;

        return {
          doctorId: doctor.id,
          doctorName: doctor.name,
          specialization: doctor.specialization,
          status: doctor.status,
          primaryHospital,
          additionalHospitals,
          weeklySessions: weeklySessionMap.get(doctor.id) ?? 0,
          totalHospitals: hospitals.length,
        };
      });

      const multiHospitalDoctors = assignments.filter((assignment) => assignment.totalHospitals > 1).length;
      const activeHospitals = new Set(activeHospitalIds.map((record) => record.hospitalId)).size;

      return {
        assignments: assignments.sort((a, b) => a.doctorName.localeCompare(b.doctorName)),
        stats: {
          totalAssignments: activeAssignmentCount,
          multiHospitalDoctors,
          activeHospitals,
          weeklySessions: totalWeeklySessions,
        },
      };
    } catch (error) {
      logger.error('Error fetching doctor-hospital assignments:', error);
      return {
        assignments: [],
        stats: {
          totalAssignments: 0,
          multiHospitalDoctors: 0,
          activeHospitals: 0,
          weeklySessions: 0,
        },
      };
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
  async createSession(data: any): Promise<any> {
    try {
      // For now, if no nurseId is provided, we try to find the first available nurse to satisfy the foreign key constraint.
      // In a real app, this should be selected by the user.
      let nurseId = data.nurseId;
      if (!nurseId) {
        const nurse = await prisma.nurseDetail.findFirst();
        if (nurse) {
          nurseId = nurse.id;
        } else {
          // If no nurse exists, create a dummy one if we can, or throw error.
          // For safety, let's assume one exists or we fail.
          throw new Error("No nurse available to assign to session");
        }
      }

      const session = await prisma.session.create({
        data: {
          doctorId: data.doctorId,
          hospitalId: data.hospitalId,
          nurseId: nurseId,
          location: data.location || 'Room 1',
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          scheduledAt: new Date(data.date), // Assuming date is passed
          capacity: data.capacity || 20,
          status: 'SCHEDULED',
          // duration is calculated or optional
        },
        include: {
          doctor: true,
          hospital: true
        }
      });
      return session;
    } catch (error) {
      logger.error('Error creating session:', error);
      throw error;
    }
  }

  async updateSession(id: string, data: any): Promise<any> {
    try {
      const session = await prisma.session.update({
        where: { id },
        data: {
          doctorId: data.doctorId,
          hospitalId: data.hospitalId,
          nurseId: data.nurseId,
          location: data.location,
          startTime: data.startTime ? new Date(data.startTime) : undefined,
          endTime: data.endTime ? new Date(data.endTime) : undefined,
          scheduledAt: data.date ? new Date(data.date) : undefined,
          capacity: data.capacity,
          status: data.status,
        },
        include: {
          doctor: true,
          hospital: true
        }
      });
      return session;
    } catch (error) {
      logger.error('Error updating session:', error);
      throw error;
    }
  }
  async assignDoctorToHospital(doctorId: string, hospitalId: string): Promise<any> {
    try {
      // Check if assignment already exists
      const existingAssignment = await prisma.doctorHospital.findUnique({
        where: {
          doctorId_hospitalId: {
            doctorId,
            hospitalId,
          },
        },
      });

      if (existingAssignment) {
        if (!existingAssignment.isActive) {
          // Reactivate if it was inactive
          return await prisma.doctorHospital.update({
            where: { id: existingAssignment.id },
            data: { isActive: true, assignedAt: new Date() },
          });
        }
        return existingAssignment; // Already active
      }

      // Create new assignment
      const assignment = await prisma.doctorHospital.create({
        data: {
          doctorId,
          hospitalId,
          isActive: true,
        },
      });
      return assignment;
    } catch (error) {
      logger.error('Error assigning doctor to hospital:', error);
      throw error;
    }
  }

  async removeDoctorFromHospital(doctorId: string, hospitalId: string): Promise<boolean> {
    try {
      // We can either soft delete (isActive=false) or hard delete. 
      // The schema supports isActive, so soft delete is safer usually, but let's see if we want to remove access.
      // If we used hard delete in other places, we should stick to it. But since we have isActive, let's use it.
      // However, the user request implies "removing". Let's try to find if there's an existing assignment first.

      const assignment = await prisma.doctorHospital.findUnique({
        where: {
          doctorId_hospitalId: {
            doctorId,
            hospitalId
          }
        }
      });

      if (!assignment) return false;

      // Soft delete
      await prisma.doctorHospital.update({
        where: { id: assignment.id },
        data: { isActive: false }
      });

      return true;
    } catch (error) {
      logger.error('Error removing doctor from hospital:', error);
      return false;
    }
  }
}

export default new DoctorService();
