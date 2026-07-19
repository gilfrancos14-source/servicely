import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAsRead, markAllAsRead } from "@/services/notificationService";
import { format } from "date-fns";
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

const typeLabels: Record<string, string> = {
  BOOKING_CREATED: "Nouvelle réservation",
  BOOKING_CONFIRMED: "Réservation confirmée",
  PAYMENT_RECEIVED: "Paiement reçu",
  BOOKING_CANCELLED: "Annulation",
  REVIEW_RECEIVED: "Avis reçu",
};

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const [limit, setLimit] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "all", limit],
    queryFn: () => getNotifications(limit),
  });

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-section-gap">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl">Notifications</h1>
            <p className="text-on-surface-variant mt-1">
              {unreadCount > 0
                ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
                : "Toutes les notifications sont lues"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              className="px-4 py-2 text-sm text-secondary font-medium border border-secondary rounded-lg hover:bg-secondary/5 transition-all"
            >
              Tout marquer lu
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-secondary border-t-transparent rounded-full" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-outline-variant">notifications_off</span>
            <h2 className="font-headline-md text-headline-md mt-4">Aucune notification</h2>
            <p className="text-on-surface-variant mt-2">Vous serez notifié lors des événements importants.</p>
            <Link
              to="/"
              className="inline-block mt-6 px-6 py-3 bg-secondary text-on-secondary rounded-lg font-button hover:opacity-90 transition-all"
            >
              Retour à l'accueil
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  if (!n.isRead) markReadMutation.mutate(n.id);
                }}
                className={`w-full text-left flex gap-4 p-4 rounded-xl transition-all hover:bg-surface-container-low ${
                  !n.isRead ? "bg-secondary/5 border border-secondary/20" : "border border-transparent"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-2xl mt-0.5 ${
                    typeColors[n.type] || "text-outline"
                  }`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {typeIcons[n.type] || "notifications"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium uppercase tracking-wider text-outline">
                      {typeLabels[n.type] || n.type}
                    </span>
                    <span className="text-[10px] text-outline">
                      {format(new Date(n.createdAt), "d MMM yyyy, HH:mm", { locale: fr })}
                    </span>
                  </div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-on-surface-variant">{n.message}</p>
                </div>
                {!n.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary mt-2 shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}

        {notifications.length >= limit && (
          <div className="text-center mt-8">
            <button
              onClick={() => setLimit(limit + 20)}
              className="px-6 py-3 text-secondary font-medium border border-secondary rounded-lg hover:bg-secondary/5 transition-all"
            >
              Charger plus
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
