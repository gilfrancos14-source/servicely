import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAsRead, markAllAsRead } from "@/services/notificationService";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const typeIcons: Record<string, string> = {
  BOOKING_CREATED: "calendar_add_on",
  BOOKING_CONFIRMED: "check_circle",
  PAYMENT_RECEIVED: "payments",
  BOOKING_CANCELLED: "cancel",
  REVIEW_RECEIVED: "star",
};

const typeColors: Record<string, string> = {
  BOOKING_CREATED: "text-secondary",
  BOOKING_CONFIRMED: "text-success",
  PAYMENT_RECEIVED: "text-success",
  BOOKING_CANCELLED: "text-error",
  REVIEW_RECEIVED: "text-warning",
};

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => getNotifications(5),
    refetchInterval: 30_000,
  });

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-full flex items-center justify-center border border-outline-variant/50 hover:bg-surface-container-low transition-colors"
      >
        <Bell className="h-4 w-4 text-on-surface-variant" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-secondary text-on-secondary text-[8px] font-medium flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-outline-variant/30 shadow-xl bg-surface overflow-hidden z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/30">
            <h3 className="font-bold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs text-secondary font-medium hover:underline"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-5 w-5 border-2 border-secondary border-t-transparent rounded-full" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-outline text-sm">Aucune notification</div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) markReadMutation.mutate(n.id);
                  }}
                  className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-surface-container-low transition-colors ${
                    !n.isRead ? "bg-secondary/5" : ""
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-lg mt-0.5 ${
                      typeColors[n.type] || "text-outline"
                    }`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {typeIcons[n.type] || "notifications"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <p className="text-xs text-on-surface-variant line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-outline mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-secondary mt-1.5 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block text-center text-sm text-secondary font-medium py-3 border-t border-outline-variant/30 hover:bg-surface-container-low transition-colors"
          >
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
  );
}
