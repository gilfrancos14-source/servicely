import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase().trim(),
  password: z.string().min(8, "Minimum 8 caractères").trim(),
  firstName: z.string().min(1, "Prénom requis").trim(),
  lastName: z.string().min(1, "Nom requis").trim(),
  role: z.enum(["CLIENT", "PROVIDER"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase().trim(),
  password: z.string().min(1, "Mot de passe requis").trim(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token requis"),
});

export const googleAuthSchema = z.object({
  token: z.string().min(1, "Token Google requis"),
});
