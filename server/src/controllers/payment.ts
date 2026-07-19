import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/db";
import { AppError } from "@/middlewares/errorHandler";
import { env } from "@/config/env";

const PAYPAL_API = env.PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new AppError(502, `PayPal auth failed: ${err}`, "PAYPAL_AUTH_ERROR");
  }

  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export async function createPayPalOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { totalPrice, serviceId } = req.body;

    if (!totalPrice || Number(totalPrice) <= 0) {
      throw new AppError(400, "Montant invalide", "INVALID_AMOUNT");
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        provider: { select: { id: true, userId: true } },
      },
    });

    if (!service || !service.isActive) {
      throw new AppError(404, "Service introuvable", "SERVICE_NOT_FOUND");
    }

    const platformPaypalEmail = env.PLATFORM_PAYPAL_EMAIL;

    if (!platformPaypalEmail) {
      throw new AppError(500, "Email PayPal de la plateforme non configuré", "PLATFORM_PAYPAL_EMAIL_MISSING");
    }

    const totalPayable = Number(totalPrice) + Number(totalPrice) * 0.05;

    const token = await getPayPalAccessToken();

    const paypalRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: `${service.name} + frais de service`,
            amount: {
              currency_code: "EUR",
              value: totalPayable.toFixed(2),
            },
            payee: { email_address: platformPaypalEmail },
          },
        ],
        application_context: {
          brand_name: "Servicely",
          user_action: "PAY_NOW",
        },
      }),
    });

    if (!paypalRes.ok) {
      const err = await paypalRes.text();
      throw new AppError(502, `PayPal order creation failed: ${err}`, "PAYPAL_ORDER_ERROR");
    }

    const order = await paypalRes.json() as { id: string };
    res.json({ success: true, data: { orderId: order.id } });
  } catch (err) {
    next(err);
  }
}

export async function capturePayPalOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderId, serviceId, providerId, startTime, endTime, notes } = req.body;
    const userId = req.user!.id;

    if (!orderId || !serviceId || !providerId || !startTime || !endTime) {
      throw new AppError(400, "Données de réservation incomplètes", "MISSING_BOOKING_DATA");
    }

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

    const token = await getPayPalAccessToken();

    const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!captureRes.ok) {
      const err = await captureRes.text();
      throw new AppError(502, `PayPal capture failed: ${err}`, "PAYPAL_CAPTURE_ERROR");
    }

    const capture = await captureRes.json() as { status: string; id: string; purchase_units?: { payments: { captures: { id: string }[] } }[] };

    if (capture.status !== "COMPLETED") {
      throw new AppError(400, `PayPal order status: ${capture.status}`, "PAYPAL_NOT_COMPLETED");
    }

    const captureId: string | undefined = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id || capture.id;

    const bookingStart = new Date(startTime);
    const bookingEnd = new Date(endTime);

    if (bookingStart >= bookingEnd) {
      throw new AppError(400, "La date de fin doit être après la date de début", "INVALID_TIME_RANGE");
    }

    const totalPaid = Number(service.price) + Number(service.price) * 0.05;

    const booking = await prisma.$transaction(async (tx) => {
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

      const newBooking = await tx.booking.create({
        data: {
          clientId: userId,
          providerId,
          serviceId,
          timeSlotId: timeSlot.id,
          totalPrice: totalPaid,
          paymentStatus: "PAID",
          status: "CONFIRMED",
          paypalOrderId: orderId,
          notes: notes || null,
        },
        include: {
          client: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          provider: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
          service: true,
          timeSlot: true,
        },
      });

      await tx.payment.create({
        data: {
          bookingId: newBooking.id,
          amount: totalPaid,
          currency: "EUR",
          paypalOrderId: orderId,
          paypalCaptureId: captureId || orderId,
          status: "PAID",
        },
      });

      const platformFee = Number(service.price) * 0.1 + Number(service.price) * 0.05;
      const netAmount = Number(service.price) * 0.9;

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

      await tx.notification.create({
        data: {
          userId: provider.userId,
          type: "BOOKING_CREATED",
          title: "Nouvelle réservation",
          message: `Vous avez reçu une nouvelle réservation pour ${service.name}`,
          data: { bookingId: newBooking.id },
        },
      });

      await tx.notification.create({
        data: {
          userId: userId,
          type: "PAYMENT_RECEIVED",
          title: "Réservation confirmée",
          message: `Votre réservation pour ${service.name} est confirmée. Paiement de ${totalPaid.toFixed(2)} € reçu.`,
          data: { bookingId: newBooking.id },
        },
      });

      return newBooking;
    });

    res.json({ success: true, data: { bookingId: booking.id } });
  } catch (err) {
    next(err);
  }
}
