import { Router } from "express";
import * as timeSlotController from "@/controllers/timeSlot";

const router = Router();

router.get("/", timeSlotController.getAvailableSlots);

export default router;
