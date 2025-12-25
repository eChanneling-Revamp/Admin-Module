import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ResponseHelper } from '../utils/response';
import { logger } from '../config/logger';
import { AppError } from '../types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(error, res);
    return;
  }

  // Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    ResponseHelper.validationError(res, 'Invalid data provided', error.message);
    return;
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    
    ResponseHelper.validationError(
      res,
      'Validation failed',
      JSON.stringify(validationErrors)
    );
    return;
  }

  // Custom application errors
  if (error instanceof Error && 'statusCode' in error) {
    const appError = error as AppError;
    ResponseHelper.error(res, appError.message, appError.statusCode || 500);
    return;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    ResponseHelper.unauthorized(res, 'Invalid token');
    return;
  }

  if (error.name === 'TokenExpiredError') {
    ResponseHelper.unauthorized(res, 'Token expired');
    return;
  }

  // Default error
  ResponseHelper.internalError(res, 'Something went wrong');
};

const handlePrismaError = (
  error: Prisma.PrismaClientKnownRequestError,
  res: Response
): void => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target as string[];
      ResponseHelper.conflict(
        res,
        `A record with this ${field?.join(', ') || 'field'} already exists`
      );
      break;

    case 'P2025':
      // Record not found
      ResponseHelper.notFound(res, 'Record not found');
      break;

    case 'P2003':
      // Foreign key constraint violation
      ResponseHelper.badRequest(res, 'Referenced record does not exist');
      break;

    case 'P2014':
      // Required relation violation
      ResponseHelper.badRequest(res, 'Required relation is missing');
      break;

    case 'P2021':
      // Table does not exist
      ResponseHelper.internalError(res, 'Database table not found');
      break;

    case 'P2022':
      // Column does not exist
      ResponseHelper.internalError(res, 'Database column not found');
      break;

    default:
      ResponseHelper.internalError(res, 'Database operation failed');
  }
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  ResponseHelper.notFound(res, `Route ${req.originalUrl} not found`);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
