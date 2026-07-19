import { Router } from "express";
import { authenticate, requireRole } from "@/middlewares/auth";
import * as bookingController from "@/controllers/booking";

const router = Router();

router.use(authenticate);

router.post("/", requireRole("CLIENT"), bookingController.createBooking);
router.get("/", bookingController.getMyBookings);
router.put("/:id/cancel", bookingController.cancelBooking);

export default router;
