import type { Request, Response, NextFunction } from "express";
import * as providerService from "@/services/provider";
import { AppError } from "@/middlewares/errorHandler";

async function resolveProvider(userId: string) {
  let provider = await providerService.findProviderByUserId(userId);
  if (!provider) {
    provider = await providerService.createProviderForUser(userId);
  }
  return provider;
}

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const provider = await resolveProvider(userId);
    res.json({ success: true, data: provider });
  } catch (err) {
    next(err);
  }
}

export async function getBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const provider = await resolveProvider(userId);
    const q = req.query as { status?: string; page?: string; limit?: string };
    const status = q.status as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | undefined;
    const page = Number(q.page) || 1;
    const limit = Number(q.limit) || 20;
    const [bookings, total] = await providerService.findProviderBookings(provider.id, { status, page, limit });
    res.json({
      success: true,
      data: bookings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateBookingStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const bookingId = req.params.id as string;
    const { status } = req.body as { status: "CONFIRMED" | "CANCELLED" };
    const provider = await resolveProvider(userId);
    const result = await providerService.updateBookingStatus(bookingId, provider.id, status);
    if (result.count === 0) {
      throw new AppError(404, "Réservation introuvable", "BOOKING_NOT_FOUND");
    }
    res.json({ success: true, data: { id: bookingId, status } });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const provider = await resolveProvider(userId);
    const stats = await providerService.getProviderStats(provider.id);
    res.json({ success: true, data: {
      bookingsCount: stats.bookingsCount,
      monthlyRevenue: stats.monthlyRevenue,
      averageRating: stats.averageRating,
      reviewCount: stats.reviewCount,
      revenueChange: stats.revenueChange,
    } });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    await resolveProvider(userId);
    const data = req.body as {
      firstName?: string;
      lastName?: string;
      title?: string;
      bio?: string;
      phone?: string;
      address?: string;
      notificationSettings?: Record<string, boolean>;
      twoFactorEnabled?: boolean;
    };
    const updated = await providerService.updateProviderProfile(userId, data);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function getServices(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const provider = await resolveProvider(userId);
    const services = await providerService.findProviderServices(provider.id);
    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
}

export async function createService(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const provider = await resolveProvider(userId);
    const service = await providerService.createService(provider.id, req.body);
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
}

export async function updateService(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const serviceId = req.params.id as string;
    const provider = await resolveProvider(userId);
    const result = await providerService.updateService(serviceId, provider.id, req.body);
    if (result.count === 0) {
      throw new AppError(404, "Service introuvable", "SERVICE_NOT_FOUND");
    }
    res.json({ success: true, data: { id: serviceId } });
  } catch (err) {
    next(err);
  }
}

export async function getEarnings(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const provider = await resolveProvider(userId);
    const q = req.query as { page?: string; limit?: string; days?: string };
    const page = Number(q.page) || 1;
    const limit = Number(q.limit) || 20;

    if (q.days) {
      const daily = await providerService.getDailyEarnings(provider.id, Number(q.days));
      res.json({ success: true, data: daily });
      return;
    }

    const [earnings, total] = await providerService.findProviderEarnings(provider.id, { page, limit });
    res.json({
      success: true,
      data: earnings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function updatePaypalEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { email } = req.body as { email: string };
    const updated = await providerService.updatePaypalEmail(userId, email);
    res.json({ success: true, data: { paypalEmail: updated.paypalEmail } });
  } catch (err) {
    next(err);
  }
}

export async function getWeeklyHours(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const provider = await resolveProvider(userId);
    const hours = await providerService.getWeeklyHours(provider.id);
    res.json({ success: true, data: hours });
  } catch (err) {
    next(err);
  }
}
