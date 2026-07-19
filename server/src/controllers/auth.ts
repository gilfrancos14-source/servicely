import type { Request, Response, NextFunction } from "express";
import * as authService from "@/services/auth";
import { AppError } from "@/middlewares/errorHandler";
import { env } from "@/config/env";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const existing = await authService.findUserByEmail(email);
    if (existing) {
      throw new AppError(409, "Cet email est déjà utilisé", "EMAIL_EXISTS");
    }

    const passwordHash = await authService.hashPassword(password);
    const user = await authService.createUser({ email, passwordHash, firstName, lastName, role });

    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = await authService.findUserByEmail(email);
    if (!user || !user.passwordHash) {
      throw new AppError(401, "Email ou mot de passe incorrect", "INVALID_CREDENTIALS");
    }

    const isValid = await authService.comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, "Email ou mot de passe incorrect", "INVALID_CREDENTIALS");
    }

    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;

    let decoded: { id: string; email: string; role: string };
    try {
      decoded = authService.verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(401, "Refresh token invalide ou expiré", "INVALID_REFRESH_TOKEN");
    }

    const user = await authService.findUserById(decoded.id);
    if (!user) {
      throw new AppError(401, "Utilisateur non trouvé", "USER_NOT_FOUND");
    }

    const newAccessToken = authService.generateAccessToken(user);
    const newRefreshToken = authService.generateRefreshToken(user);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function googleLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.body;

    // Verify the Google ID token
    const googleResp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    if (!googleResp.ok) {
      throw new AppError(401, "Token Google invalide", "INVALID_GOOGLE_TOKEN");
    }
    const googleData = await googleResp.json() as {
      email: string;
      given_name?: string;
      family_name?: string;
      name?: string;
      sub: string;
      aud: string;
    };

    if (googleData.aud !== env.GOOGLE_CLIENT_ID) {
      throw new AppError(401, "Token Google invalide pour cette application", "INVALID_GOOGLE_AUDIENCE");
    }

    if (!googleData.email) {
      throw new AppError(400, "Email Google manquant", "GOOGLE_EMAIL_MISSING");
    }

    // Find or create user
    let user = await authService.findUserByEmail(googleData.email);

    if (!user) {
      const firstName = googleData.given_name || googleData.name?.split(" ")[0] || "Utilisateur";
      const lastName = googleData.family_name || googleData.name?.split(" ").slice(1).join(" ") || "Google";
      user = await authService.createUser({
        email: googleData.email,
        passwordHash: null,
        firstName,
        lastName,
        role: "CLIENT",
      });
    }

    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { firstName, lastName, phone } = req.body;

    const updated = await authService.updateUser(userId, {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone }),
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        role: updated.role,
        phone: updated.phone,
        avatar: updated.avatar,
        isVerified: updated.isVerified,
        twoFactorEnabled: updated.twoFactorEnabled,
        notificationSettings: updated.notificationSettings,
        loyaltyPoints: updated.loyaltyPoints,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, "Non authentifié", "UNAUTHENTICATED");
    }

    const user = await authService.findUserById(userId);
    if (!user) {
      throw new AppError(404, "Utilisateur non trouvé", "USER_NOT_FOUND");
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        notificationSettings: user.notificationSettings,
        loyaltyPoints: user.loyaltyPoints,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}
