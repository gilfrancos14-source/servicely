import { Router } from "express";
import { authenticate, requireRole } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import {
  updateBookingStatusSchema,
  bookingQuerySchema,
  updateProfileSchema,
  createServiceSchema,
  updateServiceSchema,
  updatePaypalEmailSchema,
  earningsQuerySchema,
} from "@/schemas/provider";
import * as providerController from "@/controllers/provider";

const router = Router();

router.use(authenticate, requireRole("PROVIDER"));

router.get("/me", providerController.getProfile);
router.get("/me/stats", providerController.getStats);
router.get("/me/bookings", validate(bookingQuerySchema, "query"), providerController.getBookings);
router.patch("/me/bookings/:id", validate(updateBookingStatusSchema), providerController.updateBookingStatus);
router.patch("/me/profile", validate(updateProfileSchema), providerController.updateProfile);
router.put("/me/paypal-email", validate(updatePaypalEmailSchema), providerController.updatePaypalEmail);

router.get("/me/services", providerController.getServices);
router.post("/me/services", validate(createServiceSchema), providerController.createService);
router.patch("/me/services/:id", validate(updateServiceSchema), providerController.updateService);

router.get("/me/earnings", validate(earningsQuerySchema, "query"), providerController.getEarnings);
router.get("/me/weekly-hours", providerController.getWeeklyHours);

export default router;
