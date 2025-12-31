import { Request, Response } from 'express';
import { z } from 'zod';
import { AppointmentStatus, PaymentStatus, Gender } from '@prisma/client';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../middlewares/error.middleware';
import { logger } from '../config/logger';
import { prisma } from '../config/database';

// Validation schemas
const createAppointmentSchema = z.object({
  body: z.object({
    patientName: z.string().min(1, 'Patient name is required'),
    patientEmail: z.string().email('Valid email is required'),
    patientPhone: z.string().min(1, 'Phone number is required'),
    patientNIC: z.string().optional(),
    patientDateOfBirth: z.string().datetime().optional(),
    patientGender: z.nativeEnum(Gender),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    medicalHistory: z.string().optional(),
    currentMedications: z.string().optional(),
    allergies: z.string().optional(),
    insuranceProvider: z.string().optional(),
    insurancePolicyNumber: z.string().optional(),
    isNewPatient: z.boolean().optional(),
    sessionId: z.string().min(1, 'Session ID is required'),
    consultationFee: z.number().min(0),
    totalAmount: z.number().min(0),
    notes: z.string().optional(),
  }),
});

const updateAppointmentSchema = z.object({
  body: z.object({
    patientName: z.string().min(1).optional(),
    patientEmail: z.string().email().optional(),
    patientPhone: z.string().optional(),
    patientNIC: z.string().optional(),
    patientDateOfBirth: z.string().datetime().optional(),
    patientGender: z.nativeEnum(Gender).optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    medicalHistory: z.string().optional(),
    currentMedications: z.string().optional(),
    allergies: z.string().optional(),
    insuranceProvider: z.string().optional(),
    insurancePolicyNumber: z.string().optional(),
    isNewPatient: z.boolean().optional(),
    estimatedWaitTime: z.number().optional(),
    queuePosition: z.number().optional(),
    status: z.nativeEnum(AppointmentStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    consultationFee: z.number().min(0).optional(),
    totalAmount: z.number().min(0).optional(),
    notes: z.string().optional(),
    cancellationReason: z.string().optional(),
  }),
});

export class AppointmentController {
  // Placeholder for appointment service/repository
  // private appointmentService = new AppointmentService();

  createAppointment = asyncHandler(async (req: Request, res: Response) => {
    const appointmentData = req.body;
    const currentUserId = req.user?.userId;

    try {
      // TODO: Implement appointment creation logic
      // const result = await this.appointmentService.create({
      //   ...appointmentData,
      //   bookedById: currentUserId,
      // });
      
      ResponseHelper.created(res, {
        id: 'temp-appointment-id',
        appointmentNumber: 'APT-001',
        ...appointmentData,
        bookedById: currentUserId,
        status: AppointmentStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, 'Appointment created successfully');
    } catch (error) {
      logger.error('Create appointment error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to create appointment');
    }
  });

  getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      // TODO: Implement appointment retrieval logic
      // const appointment = await this.appointmentService.findById(id);
      
      ResponseHelper.success(res, {
        id,
        appointmentNumber: 'APT-001',
        patientName: 'John Doe',
        patientEmail: 'john.doe@example.com',
        status: AppointmentStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, 'Appointment retrieved successfully');
    } catch (error) {
      logger.error('Get appointment error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve appointment');
    }
  });

  getAppointments = asyncHandler(async (req: Request, res: Response) => {
    const { page = '1', limit = '10', status, search } = req.query;

    try {
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: any = {};
      if (status) {
        where.status = status as AppointmentStatus;
      }
      if (search) {
        where.OR = [
          { patientName: { contains: search as string, mode: 'insensitive' } },
          { patientEmail: { contains: search as string, mode: 'insensitive' } },
          { appointmentNumber: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      // Fetch appointments from database
      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
          include: {
            session: {
              include: {
                doctor: true,
                hospital: true,
              }
            },
            bookedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            payments: true,
          }
        }),
        prisma.appointment.count({ where }),
      ]);
      
      ResponseHelper.paginated(res, appointments, {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      }, 'Appointments retrieved successfully');
    } catch (error) {
      logger.error('Get appointments error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to retrieve appointments');
    }
  });

  updateAppointment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
      // TODO: Implement appointment update logic
      // const result = await this.appointmentService.update(id, updateData);
      
      ResponseHelper.success(res, {
        id,
        ...updateData,
        updatedAt: new Date(),
      }, 'Appointment updated successfully');
    } catch (error) {
      logger.error('Update appointment error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to update appointment');
    }
  });

  cancelAppointment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    try {
      // TODO: Implement appointment cancellation logic
      // const result = await this.appointmentService.update(id, {
      //   status: AppointmentStatus.CANCELLED,
      //   cancellationReason,
      //   cancellationDate: new Date(),
      // });
      
      ResponseHelper.success(res, {
        id,
        status: AppointmentStatus.CANCELLED,
        cancellationReason,
        cancellationDate: new Date(),
        updatedAt: new Date(),
      }, 'Appointment cancelled successfully');
    } catch (error) {
      logger.error('Cancel appointment error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Failed to cancel appointment');
    }
  });
}

// Export validation schemas
export {
  createAppointmentSchema,
  updateAppointmentSchema,
};
