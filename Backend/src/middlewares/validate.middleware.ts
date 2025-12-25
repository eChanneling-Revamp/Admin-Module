import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ResponseHelper } from '../utils/response';
import { logger } from '../config/logger';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body, query, and params
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with validated data
      req.body = validatedData.body || req.body;
      req.query = validatedData.query || req.query;
      req.params = validatedData.params || req.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Validation error:', {
          errors: validationErrors,
          url: req.url,
          method: req.method,
          body: req.body,
        });

        ResponseHelper.validationError(
          res,
          'Validation failed',
          JSON.stringify(validationErrors)
        );
        return;
      }

      logger.error('Validation middleware error:', error);
      ResponseHelper.internalError(res, 'Validation error');
    }
  };
};

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        ResponseHelper.validationError(
          res,
          'Invalid request body',
          JSON.stringify(validationErrors)
        );
        return;
      }

      ResponseHelper.internalError(res, 'Validation error');
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        ResponseHelper.validationError(
          res,
          'Invalid query parameters',
          JSON.stringify(validationErrors)
        );
        return;
      }

      ResponseHelper.internalError(res, 'Validation error');
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        ResponseHelper.validationError(
          res,
          'Invalid URL parameters',
          JSON.stringify(validationErrors)
        );
        return;
      }

      ResponseHelper.internalError(res, 'Validation error');
    }
  };
};
