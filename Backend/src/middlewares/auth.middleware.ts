import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';
import { prisma } from '../config/database';
import { ResponseHelper } from '../utils/response';
import { logger } from '../config/logger';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      ResponseHelper.unauthorized(res, 'Access token required');
      return;
    }

    // Verify the token
    const decoded = verifyAccessToken(token);
    
    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      ResponseHelper.unauthorized(res, 'User not found');
      return;
    }

    if (!user.isActive) {
      ResponseHelper.unauthorized(res, 'User account is deactivated');
      return;
    }

    // Add user info to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      ResponseHelper.unauthorized(res, 'Token expired');
      return;
    }
    
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      ResponseHelper.unauthorized(res, 'Invalid token');
      return;
    }

    ResponseHelper.unauthorized(res, 'Invalid token');
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    const decoded = verifyAccessToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (user && user.isActive) {
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on token errors
    next();
  }
};

export const requireActiveUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    ResponseHelper.unauthorized(res, 'Authentication required');
    return;
  }

  next();
};
