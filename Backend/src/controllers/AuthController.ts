import { Request, Response } from 'express';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { AuthService } from '../services/AuthService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../middlewares/error.middleware';
import { logger } from '../config/logger';

// Validation schemas
const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    twoFA: z.string().length(6, '2FA code must be 6 digits'),
  }),
});

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().optional(),
    role: z.nativeEnum(UserRole).optional(),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),
});

const verifyOTPSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Identifier is required'),
    otp: z.string().min(6, 'OTP must be 6 characters').max(6, 'OTP must be 6 characters'),
  }),
});

export class AuthController {
  private authService = new AuthService();

  login = asyncHandler(async (req: Request, res: Response) => {
    const { username, password, twoFA } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    try {
      const result = await this.authService.login(
        { username, password, twoFA },
        ipAddress,
        userAgent
      );

      ResponseHelper.success(res, result, 'Login successful');
    } catch (error) {
      logger.error('Login error:', error);
      ResponseHelper.unauthorized(res, error instanceof Error ? error.message : 'Login failed');
    }
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name, role } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    try {
      const result = await this.authService.register(
        { email, password, name, role },
        ipAddress,
        userAgent
      );

      ResponseHelper.created(res, result, 'User registered successfully');
    } catch (error) {
      logger.error('Registration error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Registration failed');
    }
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    try {
      const result = await this.authService.refreshToken({ refreshToken });
      ResponseHelper.success(res, result, 'Token refreshed successfully');
    } catch (error) {
      logger.error('Token refresh error:', error);
      ResponseHelper.unauthorized(res, error instanceof Error ? error.message : 'Token refresh failed');
    }
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    try {
      await this.authService.logout(refreshToken);
      ResponseHelper.success(res, null, 'Logout successful');
    } catch (error) {
      logger.error('Logout error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Logout failed');
    }
  });

  logoutAll = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      ResponseHelper.unauthorized(res, 'User not authenticated');
      return;
    }

    try {
      await this.authService.logoutAll(userId);
      ResponseHelper.success(res, null, 'Logged out from all devices');
    } catch (error) {
      logger.error('Logout all error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Logout failed');
    }
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
      await this.authService.forgotPassword({ email });
      ResponseHelper.success(res, null, 'Password reset email sent if account exists');
    } catch (error) {
      logger.error('Forgot password error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Password reset failed');
    }
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;

    try {
      await this.authService.resetPassword({ token, password });
      ResponseHelper.success(res, null, 'Password reset successfully');
    } catch (error) {
      logger.error('Reset password error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Password reset failed');
    }
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      ResponseHelper.unauthorized(res, 'User not authenticated');
      return;
    }

    const { currentPassword, newPassword } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    try {
      await this.authService.changePassword(
        userId,
        { currentPassword, newPassword },
        ipAddress,
        userAgent
      );
      ResponseHelper.success(res, null, 'Password changed successfully');
    } catch (error) {
      logger.error('Change password error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'Password change failed');
    }
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      ResponseHelper.unauthorized(res, 'User not authenticated');
      return;
    }

    try {
      const result = await this.authService.verifyToken(req.headers.authorization?.split(' ')[1] || '');
      ResponseHelper.success(res, result, 'Profile retrieved successfully');
    } catch (error) {
      logger.error('Get profile error:', error);
      ResponseHelper.unauthorized(res, error instanceof Error ? error.message : 'Profile retrieval failed');
    }
  });

  verifyOTP = asyncHandler(async (req: Request, res: Response) => {
    const { identifier, otp } = req.body;

    try {
      // For now, we'll implement a simple OTP verification
      // In a real implementation, you would verify against a stored OTP
      const result = await this.authService.verifyOTP(identifier, otp);
      ResponseHelper.success(res, result, 'OTP verified successfully');
    } catch (error) {
      logger.error('OTP verification error:', error);
      ResponseHelper.badRequest(res, error instanceof Error ? error.message : 'OTP verification failed');
    }
  });
}

// Export validation schemas
export {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyOTPSchema,
};
