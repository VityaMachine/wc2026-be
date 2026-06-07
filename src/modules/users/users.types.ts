import type { AuthUserRole } from "../auth/auth.types";

export interface UserProfileDto {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: AuthUserRole;
  isEmailVerified: boolean;
  emailVerifiedAt: Date | null;
  createdAt: Date;
}
