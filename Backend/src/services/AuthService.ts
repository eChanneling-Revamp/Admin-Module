import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { prisma } from '../config/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../config/jwt';
import { logger } from '../config/logger';
import { AuditService } from './AuditService';
import crypto from 'crypto';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '../types/auth';

export class AuthService {
  private auditService = new AuditService();

  async login(loginData: LoginRequest, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    const { username, password, twoFA } = loginData;

    logger.info(`Login attempt with username: ${username}`);

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: username },
          { name: username }
        ]
      },
    });

    logger.info(`User found: ${user ? 'YES' : 'NO'}`);
    if (user) {
      logger.info(`User details: ID=${user.id}, Email=${user.email}, Name=${(user as any).name}`);
    }

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Verify 2FA code (simple validation - accept 123456 for now)
    if (twoFA !== '123456') {
      throw new Error('Invalid 2FA code');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      tokenId: crypto.randomUUID(),
    });

    // Store refresh token - temporarily disabled to avoid database schema issues
    // TODO: Enable this after refresh_tokens table is created
    /*
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
    */

    // Log audit - temporarily disabled to avoid database schema issues
    // TODO: Enable this after audit_logs table is properly created
    /*
    await this.auditService.log({
      userId: user.id,
      action: 'LOGIN',
      description: 'User logged in successfully',
      ipAddress,
      userAgent,
    });
    */

    return {
      user: {
        id: user.id,
        email: user.email,
        name: (user as any).name || undefined,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt || undefined,
      },
      accessToken,
      refreshToken,
    };
  }

  async register(registerData: RegisterRequest, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    const { email, password, name, role = UserRole.PATIENT } = registerData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || 'Unknown User',
        role,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      tokenId: crypto.randomUUID(),
    });

    // Store refresh token
    // await prisma.refreshToken.create({
    //   data: {
    //     token: refreshToken,
    //     userId: user.id,
    //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    //   },
    // });

    // Log audit - temporarily disabled to avoid database schema issues
    // TODO: Enable this after audit_logs table is properly created
    /*
    await this.auditService.log({
      userId: user.id,
      action: 'REGISTER',
      description: 'User registered successfully',
      ipAddress,
      userAgent,
    });
    */

    // Log user registration (in production, you would send welcome email here)
    logger.info(`User registered: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: (user as any).name || undefined,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt || undefined,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshData: RefreshTokenRequest): Promise<{ accessToken: string }> {
    // Refresh token functionality temporarily disabled
    // TODO: Enable this after refresh_tokens table is created
    throw new Error('Refresh token functionality temporarily disabled');

    /*
    const { refreshToken } = refreshData;

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || !storedToken.user) {
      throw new Error('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new Error('Refresh token expired');
    }

    if (!storedToken.user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });

    return { accessToken };
    */
  }

  async logout(refreshToken: string): Promise<void> {
    // Logout functionality temporarily disabled
    // TODO: Enable this after refresh_tokens table is created
    // await prisma.refreshToken.deleteMany({
    //   where: { token: refreshToken },
    // });
  }

  async logoutAll(userId: string): Promise<void> {
    // Logout all functionality temporarily disabled  
    // TODO: Enable this after refresh_tokens table is created
    // await prisma.refreshToken.deleteMany({
    //   where: { userId },
    // });
  }

  async forgotPassword(forgotData: ForgotPasswordRequest): Promise<void> {
    const { email } = forgotData;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomUUID();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token (you might want to create a separate table for this)
    // For now, we'll use a simple approach with user metadata
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // You might want to add resetToken and resetExpires fields to User model
      },
    });

    // Log reset request (in production, you would send email here)
    logger.info(`Password reset requested for user: ${user.email}`);

    // Log audit
    await this.auditService.log({
      userId: user.id,
      action: 'FORGOT_PASSWORD',
      description: 'Password reset requested',
    });
  }

  async resetPassword(resetData: ResetPasswordRequest): Promise<void> {
    const { token, password } = resetData;

    // In a real implementation, you would verify the reset token
    // and check its expiration. For now, we'll skip this validation.

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password (you would need to find user by reset token)
    // This is a simplified implementation
    throw new Error('Reset password functionality needs proper token validation implementation');
  }

  async changePassword(
    userId: string,
    changeData: ChangePasswordRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const { currentPassword, newPassword } = changeData;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Logout all sessions - temporarily disabled
    // await this.logoutAll(userId);

    // Log audit - temporarily disabled to avoid database schema issues
    // TODO: Enable this after audit_logs table is properly created
    /*
    await this.auditService.log({
      userId,
      action: 'CHANGE_PASSWORD',
      description: 'Password changed successfully',
      ipAddress,
      userAgent,
    });
    */
  }

  async verifyToken(token: string): Promise<{ userId: string; email: string; role: string }> {
    const decoded = verifyRefreshToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid token');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async verifyOTP(identifier: string, otp: string): Promise<{ resetToken: string; message: string }> {
    // For demo purposes, we'll accept any 6-digit OTP as valid
    // In a real implementation, you would:
    // 1. Check if OTP exists and is valid for the identifier
    // 2. Check if OTP is not expired
    // 3. Generate a reset token
    // 4. Mark OTP as used
    
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      throw new Error('Invalid OTP format');
    }

    // Generate a simple reset token (in production, use a more secure method)
    const resetToken = generateAccessToken({ userId: identifier, email: identifier, role: 'USER' });
    
    return {
      resetToken,
      message: 'OTP verified successfully',
    };
  }
}

export default new AuthService();
