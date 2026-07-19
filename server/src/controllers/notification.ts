import type { Request, Response, NextFunction } from "express";
import * as notificationService from "@/services/notification";
import { AppError } from "@/middlewares/errorHandler";

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const limit = Number(req.query.limit) || 10;
    const notifications = await notificationService.findNotifications(userId, limit);
    const unreadCount = await notificationService.findUnreadCount(userId);
    res.json({ success: true, data: notifications, meta: { unreadCount } });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id as string;
    const result = await notificationService.markAsRead(notificationId, userId);
    if (result.count === 0) {
      throw new AppError(404, "Notification introuvable", "NOTIFICATION_NOT_FOUND");
    }
    res.json({ success: true, data: { id: notificationId } });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    await notificationService.markAllAsRead(userId);
    res.json({ success: true, data: { message: "Toutes les notifications ont été marquées comme lues" } });
  } catch (err) {
    next(err);
  }
}
