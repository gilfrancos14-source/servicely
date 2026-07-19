import { api } from "./api";
import type { ApiResponse, Notification } from "@/types";

export function getNotifications(params?: { limit?: number }) {
  return api
    .get<ApiResponse<Notification[]> & { meta: { unreadCount: number } }>("/notifications", { params })
    .then((r) => ({ notifications: r.data.data, unreadCount: r.data.meta.unreadCount }));
}

export function markAsRead(id: string) {
  return api.patch<ApiResponse<{ id: string }>>(`/notifications/${id}/read`).then((r) => r.data.data);
}

export function markAllAsRead() {
  return api.patch<ApiResponse<{ message: string }>>("/notifications/read-all").then((r) => r.data.data);
}
