import { Router } from "express";
import { validate } from "@/middlewares/validate";
import { authenticate } from "@/middlewares/auth";
import { registerSchema, loginSchema, refreshSchema, googleAuthSchema } from "@/schemas/auth";
import * as authController from "@/controllers/auth";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/google", validate(googleAuthSchema), authController.googleLogin);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.get("/me", authenticate, authController.me);
router.patch("/me/profile", authenticate, authController.updateProfile);

export default router;
