import { z } from "zod";

export const updateBookingStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED"], { message: "Statut invalide" }),
});

export const bookingQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  title: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  notificationSettings: z.record(z.string(), z.boolean()).optional(),
  twoFactorEnabled: z.boolean().optional(),
});

export const createServiceSchema = z.object({
  name: z.string().min(1, "Nom requis").max(200).trim(),
  description: z.string().min(1, "Description requise").max(5000).trim(),
  price: z.coerce.number().positive("Prix invalide"),
  duration: z.coerce.number().int().positive("Durée invalide"),
  categoryId: z.string().min(1, "Catégorie requise"),
  unit: z.string().max(50).optional(),
});

export const updateServiceSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  description: z.string().min(1).max(5000).trim().optional(),
  price: z.coerce.number().positive().optional(),
  duration: z.coerce.number().int().positive().optional(),
  categoryId: z.string().min(1).optional(),
  unit: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
});

export const updatePaypalEmailSchema = z.object({
  email: z.string().email("Email PayPal invalide"),
});

export const earningsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  days: z.coerce.number().int().positive().max(365).optional(),
});
