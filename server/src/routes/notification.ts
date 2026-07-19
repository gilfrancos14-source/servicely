import { Router } from "express";
import { authenticate } from "@/middlewares/auth";
import * as notificationController from "@/controllers/notification";

const router = Router();

router.use(authenticate);

router.get("/", notificationController.getNotifications);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);

export default router;
