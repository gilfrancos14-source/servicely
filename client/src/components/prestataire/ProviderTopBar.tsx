import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/useProviderQueries";

export function ProviderTopBar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const notifRef = useRef<HTMLDivElement>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const { data: notifData, refetch: refetchNotifs } = useNotifications({ limit: 10 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = notifData?.data || [];
  const unreadCount = notifData?.unreadCount || 0;

  const avatarUrl = user?.avatar;
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "AD";



  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await markAllRead.mutateAsync();
    refetchNotifs();
  };

  const handleNotificationClick = async (id: string) => {
    await markRead.mutateAsync(id);
    refetchNotifs();
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Hier";
    return `Il y a ${days} jours`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "BOOKING": return "calendar_today";
      case "REVIEW": return "star";
      case "PAYMENT": return "payments";
      case "MESSAGE": return "chat";
      default: return "notifications";
    }
  };

  return (
    <header className="bg-surface sticky top-0 z-30 shadow-sm flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4">
      <div className="md:hidden flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-on-secondary">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>cleaning_services</span>
        </div>
        <span className="font-headline-md text-headline-md font-bold text-primary text-xl">Servicely</span>
      </div>
      <div className="hidden md:block flex-1">
        <div className="relative max-w-md group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">search</span>
          <input
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-full py-2 pl-10 pr-4 font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-ambient placeholder:text-outline"
            placeholder="Rechercher une mission, un client..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-stack-md">
        <div className="relative" ref={notifRef}>
          <button
            className="text-on-surface-variant hover:text-secondary transition-colors relative focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded-full p-1"
            onClick={() => setNotifOpen((v) => !v)}
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-error text-on-error text-[10px] font-bold rounded-full px-1 border-2 border-surface">
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-3 w-[360px] bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 overflow-hidden animate-scale-in origin-top-right">
              <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/50">
                <h3 className="font-label-md font-bold text-primary">Notifications</h3>
                <button className="text-sm text-secondary hover:underline font-medium" onClick={handleMarkAllRead}>Tout marquer comme lu</button>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-outline text-sm">Aucune notification</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors cursor-pointer ${!n.isRead ? "bg-secondary/5" : ""}`}
                      onClick={() => handleNotificationClick(n.id)}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${!n.isRead ? "bg-secondary/10 text-secondary" : "bg-surface-container-high text-outline"}`}>
                        <span className="material-symbols-outlined text-sm">{getIcon(n.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-label-md text-label-md ${!n.isRead ? "font-bold text-primary" : "text-on-surface"}`}>{n.title}</p>
                        <p className="text-sm text-outline truncate">{n.message}</p>
                        <p className="text-[11px] text-outline mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-2" />}
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-outline-variant/50 p-3 text-center">
                <button className="text-sm text-secondary hover:underline font-medium" onClick={() => { setNotifOpen(false); navigate("/provider/parametres"); }}>Voir toutes les notifications</button>
              </div>
            </div>
          )}
        </div>
        <button className="text-on-surface-variant hover:text-secondary transition-colors focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded-full p-1 hidden sm:block">
          <span className="material-symbols-outlined">help</span>
        </button>
        <div className="h-8 w-px bg-outline-variant mx-2 hidden sm:block" />
        <button className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded-full p-1 pr-3 hover:bg-surface-container-high transition-ambient">
          {avatarUrl ? (
            <img
              alt="Expert avatar"
              className="w-9 h-9 rounded-full object-cover border border-outline-variant"
              src={avatarUrl}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-secondary/10 text-secondary border border-outline-variant flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
          )}
          <span className="hidden lg:block font-label-md text-label-md font-medium text-on-surface">{user ? `${user.firstName} ${user.lastName[0]}.` : "Alexandre D."}</span>
        </button>
      </div>
    </header>
  );
}
