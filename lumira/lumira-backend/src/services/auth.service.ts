import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const SALT_ROUNDS = 10;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

export class AuthService {
  async register(email: string, password: string, name?: string): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name ?? null,
        settings: {
          create: {},
        },
      },
    });

    const tokens = await this.generateTokens(user.id);

    logger.info(`User registered: ${user.id}`);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async login(email: string, password: string): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id);

    logger.info(`User logged in: ${user.id}`);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async generateTokens(userId: string): Promise<AuthTokens> {
    const accessExpiresIn = env.JWT_ACCESS_EXPIRATION || '15m';
    const refreshExpiresIn = env.JWT_REFRESH_EXPIRATION || '7d';
    
    const accessToken = jwt.sign(
      { userId },
      env.JWT_SECRET,
      { expiresIn: accessExpiresIn } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      env.JWT_SECRET,
      { expiresIn: refreshExpiresIn } as jwt.SignOptions
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(token: string): Promise<AuthTokens> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new Error('Invalid refresh token');
    }

    await prisma.refreshToken.delete({
      where: { token },
    });

    return this.generateTokens(storedToken.userId);
  }

  async logout(userId: string, token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
        token,
      },
    });

    logger.info(`User logged out: ${userId}`);
  }

  async logoutAll(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    logger.info(`User logged out from all devices: ${userId}`);
  }

  async getUserById(userId: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return user ? this.sanitizeUser(user) : null;
  }

  private sanitizeUser(user: { id: string; email: string; name: string | null; createdAt: Date }): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
