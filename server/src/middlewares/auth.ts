import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./errorHandler";

export interface AuthUser {
  id: string;
  email: string;
  role: "CLIENT" | "PROVIDER" | "ADMIN";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next(new AppError(401, "Token manquant", "MISSING_TOKEN"));
    return;
  }

  const parts = authHeader.split(" ");
  const token = parts[1];

  if (!token) {
    next(new AppError(401, "Token manquant", "MISSING_TOKEN"));
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as unknown as AuthUser;
    req.user = decoded;
    next();
  } catch {
    next(new AppError(401, "Token invalide ou expiré", "INVALID_TOKEN"));
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, "Non authentifié", "UNAUTHENTICATED"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(403, "Accès non autorisé", "FORBIDDEN"));
      return;
    }

    next();
  };
}