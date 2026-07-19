import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/db";
import * as uploadService from "@/services/upload";
import * as cloudinaryService from "@/services/cloudinary";
import { AppError } from "@/middlewares/errorHandler";

export async function uploadAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const file = req.file;
    if (!file) {
      throw new AppError(400, "Aucun fichier fourni", "FILE_MISSING");
    }

    let url: string;
    const publicId = `avatar-${Date.now()}`;

    const cloudinaryUrl = await cloudinaryService.uploadAvatar(file.path, publicId);
    if (cloudinaryUrl) {
      url = cloudinaryUrl;
      await cloudinaryService.deleteLocalFile(file.path);
    } else {
      url = `/uploads/avatars/${file.filename}`;
    }

    await uploadService.updateUserAvatar(userId, url);
    res.json({ success: true, data: { url } });
  } catch (err) {
    next(err);
  }
}

export async function uploadServiceImage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const file = req.file;
    const serviceId = req.body.serviceId as string | undefined;
    if (!file) {
      throw new AppError(400, "Aucun fichier fourni", "FILE_MISSING");
    }
    if (!serviceId) {
      throw new AppError(400, "serviceId requis", "SERVICE_ID_MISSING");
    }

    const provider = await prisma.provider.findUnique({ where: { userId } });
    if (!provider) {
      throw new AppError(404, "Profil expert introuvable", "PROVIDER_NOT_FOUND");
    }

    let url: string;
    const publicId = `service-${Date.now()}`;

    const cloudinaryUrl = await cloudinaryService.uploadServiceImage(file.path, publicId);
    if (cloudinaryUrl) {
      url = cloudinaryUrl;
      await cloudinaryService.deleteLocalFile(file.path);
    } else {
      url = `/uploads/services/${file.filename}`;
    }

    await uploadService.updateServiceImage(serviceId, provider.id, url);
    res.json({ success: true, data: { url } });
  } catch (err) {
    next(err);
  }
}
