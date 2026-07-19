import { z } from "zod";

export const createPayPalOrderSchema = z.object({
  totalPrice: z.coerce.number().positive("Montant invalide"),
  serviceId: z.string().min(1, "serviceId requis"),
});

export const capturePayPalOrderSchema = z.object({
  orderId: z.string().min(1, "orderId requis"),
  serviceId: z.string().min(1, "serviceId requis"),
  providerId: z.string().min(1, "providerId requis"),
  startTime: z.string().min(1, "startTime requis"),
  endTime: z.string().min(1, "endTime requis"),
  notes: z.string().optional(),
});
