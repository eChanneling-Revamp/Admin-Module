import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { PermissionChecker } from '../utils/permissions';
import { ResponseHelper } from '../utils/response';

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseHelper.unauthorized(res, 'Authentication required');
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      ResponseHelper.forbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

export const requirePermission = (permission: {
  resource: string;
  action: string;
  conditions?: string[];
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseHelper.unauthorized(res, 'Authentication required');
      return;
    }

    const hasPermission = PermissionChecker.canAccessResource(
      req.user!.role as UserRole,
      permission.resource,
      permission.action,
      permission.conditions
    );

    if (!hasPermission) {
      ResponseHelper.forbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

export const requireAnyPermission = (permissions: Array<{
  resource: string;
  action: string;
  conditions?: string[];
}>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseHelper.unauthorized(res, 'Authentication required');
      return;
    }

    const hasAnyPermission = permissions.some(permission =>
      PermissionChecker.canAccessResource(
        req.user!.role as UserRole,
        permission.resource,
        permission.action,
        permission.conditions
      )
    );

    if (!hasAnyPermission) {
      ResponseHelper.forbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

export const requireAllPermissions = (permissions: Array<{
  resource: string;
  action: string;
  conditions?: string[];
}>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseHelper.unauthorized(res, 'Authentication required');
      return;
    }

    const hasAllPermissions = permissions.every(permission =>
      PermissionChecker.canAccessResource(
        req.user!.role as UserRole,
        permission.resource,
        permission.action,
        permission.conditions
      )
    );

    if (!hasAllPermissions) {
      ResponseHelper.forbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

// Admin only middleware
export const requireAdmin = requireRole(UserRole.ADMIN);

// Doctor or Hospital middleware
export const requireDoctorOrHospital = requireRole(UserRole.DOCTOR, UserRole.HOSPITAL);

// Hospital only middleware
export const requireHospital = requireRole(UserRole.HOSPITAL);
