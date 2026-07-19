import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/middlewares/errorHandler";
import * as timeSlotService from "@/services/timeSlot";

export async function getAvailableSlots(req: Request, res: Response, next: NextFunction) {
  try {
    const { providerId, serviceId, date } = req.query as Record<string, string>;

    if (!providerId || !serviceId || !date) {
      throw new AppError(400, "providerId, serviceId et date sont requis", "MISSING_PARAMS");
    }

    const data = await timeSlotService.getAvailableSlots(providerId, serviceId, date);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
