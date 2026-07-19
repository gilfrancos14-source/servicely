import { Router } from "express";
import { authenticate, requireRole } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { createPayPalOrderSchema, capturePayPalOrderSchema } from "@/schemas/payment";
import * as paymentController from "@/controllers/payment";

const router = Router();

router.use(authenticate);

router.post("/payments/create-order", requireRole("CLIENT"), validate(createPayPalOrderSchema), paymentController.createPayPalOrder);
router.post("/payments/capture-order", requireRole("CLIENT"), validate(capturePayPalOrderSchema), paymentController.capturePayPalOrder);

export default router;
