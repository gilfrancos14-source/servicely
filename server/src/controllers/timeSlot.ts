import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/db";
import { AppError } from "@/middlewares/errorHandler";

export async function getAvailableSlots(req: Request, res: Response, next: NextFunction) {
  try {
    const { providerId, serviceId, date } = req.query as Record<string, string>;

    if (!providerId || !serviceId || !date) {
      throw new AppError(400, "providerId, serviceId et date sont requis", "MISSING_PARAMS");
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId, isActive: true },
    });
    if (!service) {
      throw new AppError(404, "Service introuvable", "SERVICE_NOT_FOUND");
    }
    if (service.providerId !== providerId) {
      throw new AppError(400, "Ce service n'appartient pas à ce prestataire", "INVALID_PROVIDER");
    }

    const provider = await prisma.provider.findUnique({
      where: { id: providerId, isActive: true },
    });
    if (!provider) {
      throw new AppError(404, "Prestataire introuvable", "PROVIDER_NOT_FOUND");
    }

    const targetDate = new Date(date + "T00:00:00.000Z");
    if (isNaN(targetDate.getTime())) {
      throw new AppError(400, "Date invalide", "INVALID_DATE");
    }

    const dayStart = new Date(targetDate);
    dayStart.setUTCHours(8, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setUTCHours(19, 0, 0, 0);

    const duration = service.duration;
    const step = 30;

    const slots: { startTime: Date; endTime: Date }[] = [];
    const current = new Date(dayStart);

    while (current < dayEnd) {
      const endTime = new Date(current.getTime() + duration * 60_000);
      if (endTime <= dayEnd) {
        slots.push({ startTime: new Date(current), endTime });
      }
      current.setMinutes(current.getMinutes() + step);
    }

    const bookedSlots = await prisma.timeSlot.findMany({
      where: {
        providerId,
        startTime: { gte: dayStart, lt: dayEnd },
        isBooked: true,
      },
      select: { startTime: true, endTime: true },
    });

    const available = slots.filter((slot) => {
      return !bookedSlots.some(
        (booked) => slot.startTime < booked.endTime && slot.endTime > booked.startTime
      );
    });

    const morning = available.filter((s) => s.startTime.getUTCHours() < 12);
    const afternoon = available.filter((s) => s.startTime.getUTCHours() >= 12);

    res.json({
      success: true,
      data: {
        date,
        service: { id: service.id, name: service.name, duration: service.duration },
        morning,
        afternoon,
      },
    });
  } catch (err) {
    next(err);
  }
}
