import { api } from "./api";
import type {
  ApiResponse,
  Booking,
  Provider,
  Service,
} from "@/types";

/* ─── Profile ─── */
export function getProfile() {
  return api.get<ApiResponse<Provider>>("/providers/me").then((r) => r.data.data);
}

export function getStats() {
  return api
    .get<
      ApiResponse<{
        bookingsCount: number;
        monthlyRevenue: number;
        averageRating: number;
        reviewCount: number;
        revenueChange: number;
      }>
    >("/providers/me/stats")
    .then((r) => r.data.data);
}

export function updateProfile(data: {
  firstName?: string;
  lastName?: string;
  title?: string;
  bio?: string;
  phone?: string;
  address?: string;
  notificationSettings?: Record<string, boolean>;
  twoFactorEnabled?: boolean;
}) {
  return api.patch<ApiResponse<{ id: string }>>("/providers/me/profile", data).then((r) => r.data.data);
}

/* ─── Bookings ─── */
export function getBookings(params?: { status?: string; page?: number; limit?: number }) {
  return api
    .get<ApiResponse<Booking[]> & { meta: { total: number; page: number; limit: number; totalPages: number } }>(
      "/providers/me/bookings",
      { params }
    )
    .then((r) => ({ data: r.data.data, meta: r.data.meta }));
}

export function updateBookingStatus(id: string, status: "CONFIRMED" | "CANCELLED") {
  return api.patch<ApiResponse<{ id: string; status: string }>>(`/providers/me/bookings/${id}`, { status }).then((r) => r.data.data);
}

/* ─── Services ─── */
export function getServices() {
  return api.get<ApiResponse<Service[]>>("/providers/me/services").then((r) => r.data.data);
}

export function createService(data: {
  name: string;
  description: string;
  price: number;
  duration: number;
  categoryId: string;
  unit?: string;
  imageUrl?: string;
}) {
  return api.post<ApiResponse<Service>>("/providers/me/services", data).then((r) => r.data.data);
}

export function updateService(id: string, data: {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  categoryId?: string;
  unit?: string;
  imageUrl?: string;
  isActive?: boolean;
}) {
  return api.patch<ApiResponse<{ id: string }>>(`/providers/me/services/${id}`, data).then((r) => r.data.data);
}

/* ─── Earnings ─── */
export function getEarnings(params?: { page?: number; limit?: number; days?: number }) {
  return api
    .get<
      ApiResponse<{ date: string; amount: number }[] | { id: string; amount: number; createdAt: string; booking: Booking }[]> & {
        meta?: { total: number; page: number; limit: number; totalPages: number };
      }
    >("/providers/me/earnings", { params })
    .then((r) => ({ data: r.data.data, meta: r.data.meta }));
}

export function getWeeklyHours() {
  return api.get<ApiResponse<{ day: string; hours: number }[]>>("/providers/me/weekly-hours").then((r) => r.data.data);
}

/* ─── Upload ─── */
export function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return api
    .post<ApiResponse<{ url: string }>>("/upload/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data.data);
}

export function uploadServiceImage(serviceId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("serviceId", serviceId);
  return api
    .post<ApiResponse<{ url: string }>>("/upload/service-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data.data);
}


