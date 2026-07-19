import { api } from "./api";
import type { ApiResponse, Booking, Service } from "@/types";

export interface AvailableSlots {
  date: string;
  service: { id: string; name: string; duration: number };
  morning: { startTime: string; endTime: string }[];
  afternoon: { startTime: string; endTime: string }[];
}

export function getMyBookings(params?: { status?: string }) {
  return api
    .get<ApiResponse<Booking[]>>("/bookings", { params })
    .then((r) => r.data.data);
}

export function getService(id: string) {
  return api.get<ApiResponse<Service>>(`/services/${id}`).then((r) => r.data.data);
}

export function getAvailableSlots(providerId: string, serviceId: string, date: string) {
  return api
    .get<ApiResponse<AvailableSlots>>("/time-slots", {
      params: { providerId, serviceId, date },
    })
    .then((r) => r.data.data);
}

export function createBooking(data: {
  serviceId: string;
  providerId: string;
  startTime: string;
  endTime: string;
  notes?: string;
}) {
  return api.post<ApiResponse<Booking>>("/bookings", data).then((r) => r.data.data);
}
