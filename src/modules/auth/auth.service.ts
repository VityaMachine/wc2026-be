import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { signAccessToken } from '../../lib/jwt';
import { emailService } from '../email/email.service';
import type {
  RegisterRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthUserDto,
  AuthTokenResponse,
  RegisterResponse,
  VerifyEmailResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
} from './auth.types';

const PASSWORD_VALIDATION_MESSAGE =
  'Password must be at least 8 characters long, contain at least one letter, one digit, one special character, and no spaces';

function validatePassword(password: string): void {
  const isValid =
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password) &&
    /[^\w\s]/.test(password) &&
    !/\s/.test(password);

  if (!isValid) {
    const error = new Error(PASSWORD_VALIDATION_MESSAGE);
    (error as any).status = 400;
    throw error;
  }
}

function validateResetPassword(password: string): void {
  if (!password || password.length < 8) {
    const error = new Error('Password must be at least 8 characters long');
    (error as any).status = 400;
    throw error;
  }
}

export class AuthService {
  async register(req: RegisterRequest): Promise<RegisterResponse> {
    const { email, username, password, firstName, lastName } = req;

    // Validate input
    if (!email || !username || !password || !firstName || !lastName) {
      const error = new Error('Email, username, password, first name, and last name are required');
      (error as any).status = 400;
      throw error;
    }

    validatePassword(password);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const error = new Error('User already exists');
      (error as any).status = 409;
      throw error;
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        passwordHash,
      },
    });

    // Generate email verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    try {
      await emailService.sendVerificationEmail({
        to: user.email,
        username: user.username,
        token,
      });
    } catch (error) {
      // MVP behavior: registration succeeds even if email delivery fails.
      // To make email delivery strict later, rethrow this error instead.
      console.error('[auth] Failed to send verification email:', error);
    }

    // Return sanitized user with message
    return {
      message: 'Registration successful. Please verify your email.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    };
  }

  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    if (!token) {
      const error = new Error('Missing token');
      (error as any).status = 400;
      throw error;
    }

    // Find verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      const error = new Error('Invalid token');
      (error as any).status = 400;
      throw error;
    }

    // Check if already used
    if (verificationToken.usedAt) {
      const error = new Error('Already used token');
      (error as any).status = 400;
      throw error;
    }

    // Check if expired
    if (new Date() > verificationToken.expiresAt) {
      const error = new Error('Expired token');
      (error as any).status = 400;
      throw error;
    }

    // Update user
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Mark token as used
    await prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() },
    });

    return {
      message: 'Email verified successfully.',
    };
  }

  async forgotPassword(req: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = {
      message: 'If an account with this email exists, a password reset link has been sent.',
    };

    if (!req.email) {
      return response;
    }

    const user = await prisma.user.findUnique({
      where: { email: req.email },
    });

    if (!user) {
      return response;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    await emailService.sendPasswordResetEmail({
      to: user.email,
      username: user.username,
      token,
    });

    return response;
  }

  async resetPassword(req: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const { token, password } = req;

    if (!token) {
      const error = new Error('Invalid token');
      (error as any).status = 400;
      throw error;
    }

    validateResetPassword(password);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      const error = new Error('Invalid token');
      (error as any).status = 400;
      throw error;
    }

    if (resetToken.usedAt) {
      const error = new Error('Token already used');
      (error as any).status = 400;
      throw error;
    }

    if (new Date() > resetToken.expiresAt) {
      const error = new Error('Token expired');
      (error as any).status = 400;
      throw error;
    }

    const passwordHash = await bcryptjs.hash(password, 10);
    const usedAt = new Date();

    await prisma.$transaction(async (tx) => {
      const tokenUpdate = await tx.passwordResetToken.updateMany({
        where: {
          id: resetToken.id,
          usedAt: null,
        },
        data: { usedAt },
      });

      if (tokenUpdate.count !== 1) {
        const error = new Error('Token already used');
        (error as any).status = 400;
        throw error;
      }

      await tx.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      });
    });

    return {
      message: 'Password reset successfully.',
    };
  }

  async login(req: LoginRequest): Promise<AuthTokenResponse> {
    const { email, password } = req;

    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const error = new Error('Invalid email or password');
      (error as any).status = 401;
      throw error;
    }

    // Validate password
    const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      (error as any).status = 401;
      throw error;
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      const error = new Error('Please verify your email before logging in');
      (error as any).status = 403;
      throw error;
    }

    // Generate access token
    const accessToken = signAccessToken(user.id);

    // Return token and user
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    };
  }

  async getUserById(userId: string): Promise<AuthUserDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const error = new Error('User not found');
      (error as any).status = 404;
      throw error;
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      emailVerifiedAt: user.emailVerifiedAt,
    };
  }
}

export const authService = new AuthService();
