import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (error) {
    next(error);
  }
}
