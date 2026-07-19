import { api } from "./api";
import type { ApiResponse, Service, Category } from "@/types";

export function getServices(params?: {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  minRating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  return api
    .get<ApiResponse<Service[]> & { meta: { total: number; page: number; limit: number; totalPages: number } }>(
      "/services",
      { params }
    )
    .then((r) => ({ data: r.data.data, meta: r.data.meta }));
}

export function getService(id: string) {
  return api.get<ApiResponse<Service>>(`/services/${id}`).then((r) => r.data.data);
}

export function getCategories() {
  return api.get<ApiResponse<Category[]>>("/categories").then((r) => r.data.data);
}
