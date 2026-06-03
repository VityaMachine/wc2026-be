import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export function signAccessToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as any,
  };
  return jwt.sign({ userId }, env.JWT_SECRET as string, options);
}

export function verifyAccessToken(token: string) {
  try {
    const options: VerifyOptions = {};
    return jwt.verify(token, env.JWT_SECRET as string, options) as { userId: string };
  } catch (error) {
    return null;
  }
}
