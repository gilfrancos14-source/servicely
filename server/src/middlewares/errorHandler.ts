import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { MulterError } from "multer";
import { env } from "@/config/env";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  // Multer errors (file size, wrong format)
  if (err instanceof MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: "Fichier trop volumineux (max 5 Mo)",
      LIMIT_UNEXPECTED_FILE: "Champ fichier inattendu",
    };
    res.status(400).json({
      success: false,
      error: {
        code: "UPLOAD_ERROR",
        message: messages[err.code] || "Erreur lors de l'upload",
      },
    });
    return;
  }

  // Multer fileFilter errors (format non autorisé) are plain Error
  if (err.message?.includes("Format non autorisé")) {
    res.status(400).json({
      success: false,
      error: {
        code: "UPLOAD_FORMAT_ERROR",
        message: err.message,
      },
    });
    return;
  }

  // Zod validation error
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Données invalides",
        details: err.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
    });
    return;
  }

  // Prisma known errors
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        res.status(409).json({
          success: false,
          error: {
            code: "DUPLICATE_ENTRY",
            message: "Un enregistrement avec cette valeur existe déjà",
          },
        });
        return;
      case "P2025":
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Ressource non trouvée",
          },
        });
        return;
    }
  }

  // Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || "APP_ERROR",
        message: err.message,
      },
    });
    return;
  }

  // Default 500
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: env.NODE_ENV === "development" ? err.message : "Erreur interne du serveur",
    },
  });
}