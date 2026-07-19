import type { Prisma } from "@prisma/client";
import { prisma } from "@/config/db";
import { AppError } from "@/middlewares/errorHandler";
import { PLATFORM_FEE_RATE, PLATFORM_SURCHARGE_RATE } from "@/utils/constants";

interface CreateBookingParams {
  clientId: string;
  serviceId: string;
  providerId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  status?: "PENDING" | "CONFIRMED";
  paymentStatus?: "PENDING" | "PAID";
  paypalOrderId?: string;
  paypalCaptureId?: string;
  createPayment?: boolean;
  createEarning?: boolean;
  sendClientConfirmation?: boolean;
}

export async function validateServiceAndProvider(serviceId: string, providerId: string) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) {
    throw new AppError(404, "Service introuvable ou inactif", "SERVICE_NOT_FOUND");
  }

  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider || !provider.isActive) {
    throw new AppError(404, "Prestataire introuvable ou inactif", "PROVIDER_NOT_FOUND");
  }

  if (service.providerId !== providerId) {
    throw new AppError(400, "Ce service n'appartient pas à ce prestataire", "INVALID_PROVIDER");
  }

  return { service, provider };
}

export async function createBooking(params: CreateBookingParams) {
  const { clientId, serviceId, providerId, startTime, endTime, notes } = params;

  const bookingStart = new Date(startTime);
  const bookingEnd = new Date(endTime);

  if (bookingStart >= bookingEnd) {
    throw new AppError(400, "La date de fin doit être après la date de début", "INVALID_TIME_RANGE");
  }

  const { service, provider } = await validateServiceAndProvider(serviceId, providerId);

  const totalPrice = params.createPayment
    ? Number(service.price) + Number(service.price) * PLATFORM_SURCHARGE_RATE
    : Number(service.price);

  return prisma.$transaction(async (tx) => {
    const overlapping = await tx.timeSlot.findFirst({
      where: {
        providerId,
        isBooked: true,
        startTime: { lt: bookingEnd },
        endTime: { gt: bookingStart },
      },
    });
    if (overlapping) {
      throw new AppError(409, "Ce créneau est déjà réservé", "SLOT_UNAVAILABLE");
    }

    const timeSlot = await tx.timeSlot.create({
      data: {
        providerId,
        serviceId,
        startTime: bookingStart,
        endTime: bookingEnd,
        isBooked: true,
      },
    });

    const bookingData: Prisma.BookingCreateInput = {
      client: { connect: { id: clientId } },
      provider: { connect: { id: providerId } },
      service: { connect: { id: serviceId } },
      timeSlot: { connect: { id: timeSlot.id } },
      totalPrice,
      notes: notes || null,
    };
    if (params.status) bookingData.status = params.status;
    if (params.paymentStatus) bookingData.paymentStatus = params.paymentStatus;
    if (params.paypalOrderId) bookingData.paypalOrderId = params.paypalOrderId;

    const newBooking = await tx.booking.create({
      data: bookingData,
      include: {
        client: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        provider: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
        service: true,
        timeSlot: true,
      },
    });

    // Notification for the provider
    await tx.notification.create({
      data: {
        userId: provider.userId,
        type: "BOOKING_CREATED",
        title: "Nouvelle réservation",
        message: `Vous avez reçu une nouvelle réservation pour ${service.name}`,
        data: { bookingId: newBooking.id },
      },
    });

    // Client confirmation notification
    if (params.sendClientConfirmation) {
      await tx.notification.create({
        data: {
          userId: clientId,
          type: "PAYMENT_RECEIVED",
          title: "Réservation confirmée",
          message: `Votre réservation pour ${service.name} est confirmée. Paiement de ${totalPrice.toFixed(2)} € reçu.`,
          data: { bookingId: newBooking.id },
        },
      });
    }

    // Payment + Earning records
    if (params.createPayment) {
      await tx.payment.create({
        data: {
          bookingId: newBooking.id,
          amount: totalPrice,
          currency: "EUR",
          paypalOrderId: params.paypalOrderId || "",
          paypalCaptureId: params.paypalCaptureId || params.paypalOrderId || "",
          status: "PAID",
        },
      });
    }

    if (params.createEarning) {
      const platformFee = Number(service.price) * PLATFORM_FEE_RATE + Number(service.price) * PLATFORM_SURCHARGE_RATE;
      const netAmount = Number(service.price) * (1 - PLATFORM_FEE_RATE);
      await tx.earning.create({
        data: {
          providerId,
          bookingId: newBooking.id,
          amount: Number(service.price),
          platformFee,
          netAmount,
          status: "PENDING",
        },
      });
    }

    return newBooking;
  });
}
