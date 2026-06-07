import { prisma } from "../../lib/prisma";
import type { UserProfileDto } from "./users.types";

class UsersService {
  async getCurrentUserProfile(userId: string): Promise<UserProfileDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      const error = new Error("User not found");
      (error as any).status = 404;
      throw error;
    }

    return user;
  }
}

export const usersService = new UsersService();
