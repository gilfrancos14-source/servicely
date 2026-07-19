import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/db";
import { AppError } from "@/middlewares/errorHandler";
import * as reviewService from "@/services/review";

export async function getServiceReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceId = req.params.serviceId as string;

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      throw new AppError(404, "Service introuvable", "SERVICE_NOT_FOUND");
    }

    const reviews = await reviewService.getServiceReviews(serviceId);
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
}
