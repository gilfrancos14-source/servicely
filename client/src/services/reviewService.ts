import { api } from "./api";
import type { ApiResponse } from "@/types";

export interface ReviewWithClient {
  id: string;
  bookingId: string;
  clientId: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export function getServiceReviews(serviceId: string) {
  return api
    .get<ApiResponse<ReviewWithClient[]>>(`/services/${serviceId}/reviews`)
    .then((r) => r.data.data);
}
