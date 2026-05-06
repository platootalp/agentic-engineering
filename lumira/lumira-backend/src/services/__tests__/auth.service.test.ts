import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../auth.service';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

// Mock dependencies
jest.mock('../../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  const mockUserId = 'user-123';
  const mockEmail = 'test@example.com';
  const mockPassword = 'password123';
  const mockName = 'Test User';
  const mockHashedPassword = 'hashedPassword123';
  const mockAccessToken = 'mock-access-token';
  const mockRefreshToken = 'mock-refresh-token';

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
        name: mockName,
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>).mockResolvedValue(null);
      (bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>).mockResolvedValue(mockHashedPassword as never);
      (prisma.user.create as jest.MockedFunction<typeof prisma.user.create>).mockResolvedValue(mockUser as any);
      (jwt.sign as jest.MockedFunction<typeof jwt.sign>)
        .mockReturnValueOnce(mockAccessToken as never)
        .mockReturnValueOnce(mockRefreshToken as never);
      (prisma.refreshToken.create as jest.MockedFunction<typeof prisma.refreshToken.create>).mockResolvedValue({} as any);

      const result = await authService.register(mockEmail, mockPassword, mockName);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: mockEmail } });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: mockEmail,
          password: mockHashedPassword,
          name: mockName,
          settings: { create: {} },
        },
      });
      expect(result.user).toEqual({
        id: mockUserId,
        email: mockEmail,
        name: mockName,
        createdAt: mockUser.createdAt,
      });
      expect(result.tokens).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
      expect(logger.info).toHaveBeenCalledWith(`User registered: ${mockUserId}`);
    });

    it('should register a user without name', async () => {
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
        name: null,
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>).mockResolvedValue(null);
      (bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>).mockResolvedValue(mockHashedPassword as never);
      (prisma.user.create as jest.MockedFunction<typeof prisma.user.create>).mockResolvedValue(mockUser as any);
      (jwt.sign as jest.MockedFunction<typeof jwt.sign>)
        .mockReturnValueOnce(mockAccessToken as never)
        .mockReturnValueOnce(mockRefreshToken as never);
      (prisma.refreshToken.create as jest.MockedFunction<typeof prisma.refreshToken.create>).mockResolvedValue({} as any);

      const result = await authService.register(mockEmail, mockPassword);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: mockEmail,
          password: mockHashedPassword,
          name: null,
          settings: { create: {} },
        },
      });
      expect(result.user.name).toBeNull();
    });

    it('should throw error when user already exists', async () => {
      const existingUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
        name: mockName,
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>).mockResolvedValue(existingUser as any);

      await expect(authService.register(mockEmail, mockPassword, mockName)).rejects.toThrow('User already exists');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
        name: mockName,
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>).mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>).mockResolvedValue(true as never);
      (jwt.sign as jest.MockedFunction<typeof jwt.sign>)
        .mockReturnValueOnce(mockAccessToken as never)
        .mockReturnValueOnce(mockRefreshToken as never);
      (prisma.refreshToken.create as jest.MockedFunction<typeof prisma.refreshToken.create>).mockResolvedValue({} as any);

      const result = await authService.login(mockEmail, mockPassword);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: mockEmail } });
      expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockHashedPassword);
      expect(result.user).toEqual({
        id: mockUserId,
        email: mockEmail,
        name: mockName,
        createdAt: mockUser.createdAt,
      });
      expect(result.tokens).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
      expect(logger.info).toHaveBeenCalledWith(`User logged in: ${mockUserId}`);
    });

    it('should throw error when user not found', async () => {
      (prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>).mockResolvedValue(null);

      await expect(authService.login(mockEmail, mockPassword)).rejects.toThrow('User not found');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error when password is invalid', async () => {
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
        name: mockName,
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>).mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>).mockResolvedValue(false as never);

      await expect(authService.login(mockEmail, mockPassword)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      (jwt.sign as jest.MockedFunction<typeof jwt.sign>)
        .mockReturnValueOnce(mockAccessToken as never)
        .mockReturnValueOnce(mockRefreshToken as never);
      (prisma.refreshToken.create as jest.MockedFunction<typeof prisma.refreshToken.create>).mockResolvedValue({
        token: mockRefreshToken,
        userId: mockUserId,
        expiresAt: new Date(),
      } as any);

      const result = await authService.generateTokens(mockUserId);

      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const storedToken = {
        token: mockRefreshToken,
        userId: mockUserId,
        expiresAt: new Date(Date.now() + 86400000),
      };

      (prisma.refreshToken.findUnique as jest.MockedFunction<typeof prisma.refreshToken.findUnique>).mockResolvedValue(storedToken as any);
      (prisma.refreshToken.delete as jest.MockedFunction<typeof prisma.refreshToken.delete>).mockResolvedValue({} as any);
      (jwt.sign as jest.MockedFunction<typeof jwt.sign>)
        .mockReturnValueOnce('new-access-token' as never)
        .mockReturnValueOnce('new-refresh-token' as never);
      (prisma.refreshToken.create as jest.MockedFunction<typeof prisma.refreshToken.create>).mockResolvedValue({} as any);

      const result = await authService.refreshToken(mockRefreshToken);

      expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({ where: { token: mockRefreshToken } });
      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({ where: { token: mockRefreshToken } });
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw error when refresh token not found', async () => {
      (prisma.refreshToken.findUnique as jest.MockedFunction<typeof prisma.refreshToken.findUnique>).mockResolvedValue(null);

      await expect(authService.refreshToken(mockRefreshToken)).rejects.toThrow('Invalid refresh token');
    });

    it('should throw error when refresh token is expired', async () => {
      const expiredToken = {
        token: mockRefreshToken,
        userId: mockUserId,
        expiresAt: new Date(Date.now() - 86400000),
      };

      (prisma.refreshToken.findUnique as jest.MockedFunction<typeof prisma.refreshToken.findUnique>).mockResolvedValue(expiredToken as any);

      await expect(authService.refreshToken(mockRefreshToken)).rejects.toThrow('Invalid refresh token');
    });

    it('should detect refresh token reuse attempt', async () => {
      (prisma.refreshToken.findUnique as jest.MockedFunction<typeof prisma.refreshToken.findUnique>).mockResolvedValue(null);

      await expect(authService.refreshToken(mockRefreshToken)).rejects.toThrow('Invalid refresh token');
      expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({ where: { token: mockRefreshToken } });
    });
  });

  describe('logout', () => {
    it('should logout user and delete refresh token', async () => {
      (prisma.refreshToken.deleteMany as jest.MockedFunction<typeof prisma.refreshToken.deleteMany>).mockResolvedValue({ count: 1 } as any);

      await authService.logout(mockUserId, mockRefreshToken);

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, token: mockRefreshToken },
      });
      expect(logger.info).toHaveBeenCalledWith(`User logged out: ${mockUserId}`);
    });
  });

  describe('logoutAll', () => {
    it('should logout user from all devices', async () => {
      (prisma.refreshToken.deleteMany as jest.MockedFunction<typeof prisma.refreshToken.deleteMany>).mockResolvedValue({ count: 3 } as any);

      await authService.logoutAll(mockUserId);

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: mockUserId } });
      expect(logger.info).toHaveBeenCalledWith(`User logged out from all devices: ${mockUserId}`);
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        name: mockName,
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>).mockResolvedValue(mockUser as any);

      const result = await authService.getUserById(mockUserId);

      expect(result).toEqual({
        id: mockUserId,
        email: mockEmail,
        name: mockName,
        createdAt: mockUser.createdAt,
      });
    });

    it('should return null when user not found', async () => {
      (prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>).mockResolvedValue(null);

      const result = await authService.getUserById(mockUserId);
      expect(result).toBeNull();
    });
  });
});
