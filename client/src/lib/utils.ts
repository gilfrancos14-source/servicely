import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getServiceIcon(serviceName?: string): string {
  const s = (serviceName || "").toLowerCase();
  if (s.includes("ménage") || s.includes("nettoyage") || s.includes("vitres")) return "cleaning_services";
  if (s.includes("jardin") || s.includes("pelouse") || s.includes("tonte") || s.includes("haie")) return "yard";
  if (s.includes("électric") || s.includes("luminaires") || s.includes("tableau")) return "electric_bolt";
  if (s.includes("plomb") || s.includes("robinet") || s.includes("canalisation") || s.includes("débouch")) return "plumbing";
  return "service_toolbox";
}

export function formatBookingDate(startTime: string): string {
  const d = new Date(startTime);
  return format(d, "d MMM, HH:mm", { locale: fr });
}

export function formatSlotTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "HH:mm", { locale: fr });
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    CONFIRMED: "Confirmé",
    PENDING: "En attente",
    COMPLETED: "Terminé",
    CANCELLED: "Annulé",
  };
  return map[status] || status;
}

export function getStatusStyle(status: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    CONFIRMED: { bg: "bg-secondary-container", text: "text-on-secondary-container" },
    PENDING: { bg: "bg-primary-fixed", text: "text-on-primary-fixed" },
    COMPLETED: { bg: "bg-surface-container-highest", text: "text-on-surface-variant" },
    CANCELLED: { bg: "bg-error-container", text: "text-on-error-container" },
  };
  return map[status] || { bg: "bg-surface-container-highest", text: "text-on-surface-variant" };
}

export function getDashboardPath(role?: string): string {
  switch (role) {
    case "PROVIDER": return "/provider";
    case "ADMIN": return "/admin";
    default: return "/dashboard";
  }
}