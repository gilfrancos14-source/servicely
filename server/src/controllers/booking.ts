import type { Request, Response, NextFunction } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/config/db";
import { AppError } from "@/middlewares/errorHandler";
import { createBooking as createBookingService } from "@/services/booking";

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const { serviceId, providerId, startTime, endTime, notes } = req.body;
    const clientId = req.user!.id;

    const booking = await createBookingService({
      clientId,
      serviceId,
      providerId,
      startTime,
      endTime,
      notes,
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

export async function getMyBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const status = req.query.status as string | undefined;
    const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

    const where: Prisma.BookingWhereInput = {};
    if (status && validStatuses.includes(status as typeof validStatuses[number])) {
      where.status = status as typeof validStatuses[number];
    }

    if (role === "CLIENT") {
      where.clientId = userId;
    } else if (role === "PROVIDER") {
      const provider = await prisma.provider.findUnique({ where: { userId } });
      if (!provider) {
        throw new AppError(404, "Profil prestataire introuvable", "PROVIDER_NOT_FOUND");
      }
      where.providerId = provider.id;
    }

    const include: Prisma.BookingInclude = {
      service: true,
      timeSlot: true,
    };

    if (role === "CLIENT") {
      include.provider = {
        include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
      };
    } else {
      include.client = { select: { id: true, firstName: true, lastName: true, avatar: true } };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const bookingId = req.params.id as string;
    const userId = req.user!.id;
    const role = req.user!.role;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        provider: { include: { user: true } },
        client: true,
      },
    });

    if (!booking) {
      throw new AppError(404, "Réservation introuvable", "BOOKING_NOT_FOUND");
    }

    const clientId = booking.clientId;
    const providerUser = booking.provider.user;

    const isClient = role === "CLIENT" && clientId === userId;
    const isProvider = role === "PROVIDER" && providerUser.id === userId;

    if (!isClient && !isProvider) {
      throw new AppError(403, "Action non autorisée", "FORBIDDEN");
    }

    if (booking.status === "CANCELLED") {
      throw new AppError(400, "Réservation déjà annulée", "ALREADY_CANCELLED");
    }

    if (booking.status === "COMPLETED") {
      throw new AppError(400, "Impossible d'annuler une réservation terminée", "ALREADY_COMPLETED");
    }

    const cancelledAt = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED", cancelledAt },
      });

      await tx.timeSlot.update({
        where: { id: booking.timeSlotId },
        data: { isBooked: false },
      });

      const cancelledByName = isClient
        ? `${booking.client.firstName} ${booking.client.lastName}`
        : `${providerUser.firstName} ${providerUser.lastName}`;

      if (isClient) {
        await tx.notification.create({
          data: {
            userId: providerUser.id,
            type: "BOOKING_CANCELLED",
            title: "Réservation annulée",
            message: `${cancelledByName} a annulé la réservation pour ${booking.service.name}`,
            data: { bookingId },
          },
        });
      }

      if (isProvider) {
        await tx.notification.create({
          data: {
            userId: clientId,
            type: "BOOKING_CANCELLED",
            title: "Réservation annulée",
            message: `${cancelledByName} a annulé votre réservation pour ${booking.service.name}`,
            data: { bookingId },
          },
        });
      }
    });

    res.json({ success: true, data: { id: bookingId, status: "CANCELLED" } });
  } catch (err) {
    next(err);
  }
}
