import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/middlewares/errorHandler";
import * as serviceService from "@/services/service";

export async function listServices(req: Request, res: Response, next: NextFunction) {
  try {
    const [services, total] = await serviceService.listServices(req.query as Record<string, string | undefined>);

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));

    res.json({
      success: true,
      data: services,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getService(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const service = await serviceService.getServiceById(id);
    if (!service || !service.isActive) {
      throw new AppError(404, "Service introuvable", "SERVICE_NOT_FOUND");
    }
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
}
