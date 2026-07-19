import { api } from "./api";
import type { ApiResponse, Notification } from "@/types";

export function getNotifications(limit = 10) {
  return api
    .get<ApiResponse<Notification[]> & { meta: { unreadCount: number } }>("/notifications", { params: { limit } })
    .then((r) => ({ notifications: r.data.data, unreadCount: r.data.meta.unreadCount }));
}

export function markAsRead(id: string) {
  return api.patch(`/notifications/${id}/read`);
}

export function markAllAsRead() {
  return api.patch("/notifications/read-all");
}
