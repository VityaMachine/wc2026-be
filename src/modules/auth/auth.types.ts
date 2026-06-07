export type AuthUserRole = 'USER' | 'ADMIN';

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthUserDto {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: AuthUserRole;
  isEmailVerified: boolean;
  emailVerifiedAt: Date | null;
}

export interface AuthTokenResponse {
  accessToken: string;
  user: AuthUserDto;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface RegisterResponse {
  message: string;
  user: AuthUserDto;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}
