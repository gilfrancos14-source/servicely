import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/db";
import { AppError } from "@/middlewares/errorHandler";
import { env } from "@/config/env";
import { createBooking as createBookingService } from "@/services/booking";
import { PLATFORM_SURCHARGE_RATE } from "@/utils/constants";

const PAYPAL_API = env.PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken() {
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

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, name: true, price: true, isActive: true, provider: { select: { id: true, userId: true } } },
    });

    if (!service || !service.isActive) {
      throw new AppError(404, "Service introuvable", "SERVICE_NOT_FOUND");
    }

    const platformPaypalEmail = env.PLATFORM_PAYPAL_EMAIL;
    if (!platformPaypalEmail) {
      throw new AppError(500, "Email PayPal de la plateforme non configuré", "PLATFORM_PAYPAL_EMAIL_MISSING");
    }

    const totalPayable = Number(totalPrice) + Number(totalPrice) * PLATFORM_SURCHARGE_RATE;
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

interface PayPalCaptureResponse {
  status: string;
  id: string;
  purchase_units?: {
    payments: {
      captures: { id: string }[];
    };
  }[];
}

export async function capturePayPalOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderId, serviceId, providerId, startTime, endTime, notes } = req.body;
    const userId = req.user!.id;

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

    const capture = await captureRes.json() as PayPalCaptureResponse;

    if (capture.status !== "COMPLETED") {
      throw new AppError(400, `PayPal order status: ${capture.status}`, "PAYPAL_NOT_COMPLETED");
    }

    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id || capture.id;

    const booking = await createBookingService({
      clientId: userId,
      serviceId,
      providerId,
      startTime,
      endTime,
      notes,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paypalOrderId: orderId,
      paypalCaptureId: captureId,
      createPayment: true,
      createEarning: true,
      sendClientConfirmation: true,
    });

    res.json({ success: true, data: { bookingId: booking.id } });
  } catch (err) {
    next(err);
  }
}
