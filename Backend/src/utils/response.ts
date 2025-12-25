import { Response } from 'express';
import { ApiResponse } from '../types';

export class ResponseHelper {
  static success<T>(
    res: Response,
    data?: T,
    message: string = 'Success',
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string = 'Internal Server Error',
    statusCode: number = 500,
    error?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error,
    };

    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message: string = 'Success'
  ): Response {
    const response: ApiResponse<T[]> = {
      success: true,
      message,
      data,
      pagination,
    };

    return res.status(200).json(response);
  }

  static created<T>(
    res: Response,
    data?: T,
    message: string = 'Resource created successfully'
  ): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response, message: string = 'No content'): Response {
    return this.success(res, undefined, message, 204);
  }

  static badRequest(
    res: Response,
    message: string = 'Bad Request',
    error?: string
  ): Response {
    return this.error(res, message, 400, error);
  }

  static unauthorized(
    res: Response,
    message: string = 'Unauthorized',
    error?: string
  ): Response {
    return this.error(res, message, 401, error);
  }

  static forbidden(
    res: Response,
    message: string = 'Forbidden',
    error?: string
  ): Response {
    return this.error(res, message, 403, error);
  }

  static notFound(
    res: Response,
    message: string = 'Resource not found',
    error?: string
  ): Response {
    return this.error(res, message, 404, error);
  }

  static conflict(
    res: Response,
    message: string = 'Resource already exists',
    error?: string
  ): Response {
    return this.error(res, message, 409, error);
  }

  static validationError(
    res: Response,
    message: string = 'Validation failed',
    error?: string
  ): Response {
    return this.error(res, message, 422, error);
  }

  static tooManyRequests(
    res: Response,
    message: string = 'Too many requests',
    error?: string
  ): Response {
    return this.error(res, message, 429, error);
  }

  static internalError(
    res: Response,
    message: string = 'Internal Server Error',
    error?: string
  ): Response {
    return this.error(res, message, 500, error);
  }
}

export default ResponseHelper;
