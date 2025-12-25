import { AuthService } from '../services/AuthService';
import { prisma } from '../setup';
import { UserRole } from '@prisma/client';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.PATIENT,
      };

      const result = await authService.register(userData);

      expect(result).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.user.firstName).toBe(userData.firstName);
      expect(result.user.lastName).toBe(userData.lastName);
      expect(result.user.role).toBe(userData.role);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.PATIENT,
      };

      // Create user first time
      await authService.register(userData);

      // Try to create same user again
      await expect(authService.register(userData)).rejects.toThrow('User already exists with this email');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create a test user
      await authService.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.PATIENT,
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.login(loginData);

      expect(result).toBeDefined();
      expect(result.user.email).toBe(loginData.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshToken', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.PATIENT,
      };

      const result = await authService.register(userData);
      refreshToken = result.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
      const result = await authService.refreshToken({ refreshToken });

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
    });

    it('should throw error with invalid refresh token', async () => {
      const invalidToken = 'invalid-refresh-token';

      await expect(authService.refreshToken({ refreshToken: invalidToken })).rejects.toThrow();
    });
  });

  describe('logout', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.PATIENT,
      };

      const result = await authService.register(userData);
      refreshToken = result.refreshToken;
    });

    it('should logout successfully', async () => {
      await expect(authService.logout(refreshToken)).resolves.not.toThrow();
    });
  });
});
