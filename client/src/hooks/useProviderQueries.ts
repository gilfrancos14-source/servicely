import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as providerService from "@/services/provider";

/* ─── Profile ─── */
const profileKeys = {
  all: ["provider-profile"] as const,
};

export function useProviderProfile() {
  return useQuery({
    queryKey: profileKeys.all,
    queryFn: providerService.getProfile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProviderStats() {
  return useQuery({
    queryKey: ["provider-stats"],
    queryFn: providerService.getStats,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: providerService.updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

/* ─── Bookings ─── */
export function useProviderBookings(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["provider-bookings", params],
    queryFn: () => providerService.getBookings(params),
    staleTime: 30 * 1000,
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "CONFIRMED" | "CANCELLED" }) =>
      providerService.updateBookingStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider-bookings"] });
      qc.invalidateQueries({ queryKey: ["provider-stats"] });
    },
  });
}

/* ─── Services ─── */
export function useProviderServices() {
  return useQuery({
    queryKey: ["provider-services"],
    queryFn: providerService.getServices,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: providerService.createService,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider-services"] });
    },
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof providerService.updateService>[1] }) =>
      providerService.updateService(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider-services"] });
    },
  });
}

/* ─── Earnings ─── */
export function useProviderEarnings(params?: { page?: number; limit?: number; days?: number }) {
  return useQuery({
    queryKey: ["provider-earnings", params],
    queryFn: () => providerService.getEarnings(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useProviderWeeklyHours() {
  return useQuery({
    queryKey: ["provider-weekly-hours"],
    queryFn: providerService.getWeeklyHours,
    staleTime: 5 * 60 * 1000,
  });
}

/* ─── Upload ─── */
export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: providerService.uploadAvatar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useUploadServiceImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, file }: { serviceId: string; file: File }) =>
      providerService.uploadServiceImage(serviceId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider-services"] });
    },
  });
}

/* ─── Notifications ─── */
export function useNotifications(params?: { limit?: number }) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => providerService.getNotifications(params),
    staleTime: 15 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: providerService.markNotificationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: providerService.markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
