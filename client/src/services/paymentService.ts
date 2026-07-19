import { api } from "./api";
import type { ApiResponse } from "@/types";

export function createPayPalOrder(totalPrice: number, serviceId: string) {
  return api
    .post<ApiResponse<{ orderId: string }>>("/payments/create-order", { totalPrice, serviceId })
    .then((r) => r.data.data);
}

export function capturePayPalOrder(
  orderId: string,
  bookingData: {
    serviceId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }
) {
  return api
    .post<ApiResponse<{ bookingId: string }>>("/payments/capture-order", { orderId, ...bookingData })
    .then((r) => r.data.data);
}
