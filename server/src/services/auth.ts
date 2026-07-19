import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/config/db";
import { env } from "@/config/env";
import { BCRYPT_ROUNDS } from "@/utils/constants";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export function generateAccessToken(user: TokenPayload): string {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function generateRefreshToken(user: TokenPayload): string {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

interface CreateUserData {
  email: string;
  passwordHash: string | null;
  firstName: string;
  lastName: string;
  role?: string;
}

export function updateUser(userId: string, data: { firstName?: string; lastName?: string; phone?: string }) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export function createUser(data: CreateUserData) {
  const role = (data.role as "CLIENT" | "PROVIDER") ?? "CLIENT";
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role,
        isVerified: true,
      },
    });
    if (role === "PROVIDER") {
      await tx.provider.create({
        data: {
          userId: user.id,
          title: `Expert ${user.firstName}`,
          level: 1,
        },
      });
    }
    return user;
  });
}
