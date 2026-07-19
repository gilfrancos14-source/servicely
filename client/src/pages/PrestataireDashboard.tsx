import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProviderLayout } from "@/components/prestataire/ProviderLayout";
import { ProviderRequestCard } from "@/components/prestataire/ProviderRequestCard";
import { useAuth } from "@/hooks/useAuth";
import { useProviderStats, useProviderBookings, useProviderWeeklyHours, useUpdateBookingStatus } from "@/hooks/useProviderQueries";

const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

type FilterCategory = "all" | "urgent" | "normal" | "accepted" | "rejected";

const filterOptions: { label: string; value: FilterCategory }[] = [
  { label: "Toutes", value: "all" },
  { label: "Urgentes", value: "urgent" },
  { label: "Normales", value: "normal" },
  { label: "Acceptées", value: "accepted" },
  { label: "Refusées", value: "rejected" },
];

export function PrestataireDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useProviderStats();
  const { data: bookingsData, isLoading: bookingsLoading } = useProviderBookings({ limit: 20 });
  const { data: weekHours, isLoading: weekLoading } = useProviderWeeklyHours();
  const updateStatus = useUpdateBookingStatus();

  const [filterOpen, setFilterOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterCategory>("all");

  const todayBookings = useMemo(
    () => (bookingsData?.data || []).filter((b) => b.status === "PENDING"),
    [bookingsData]
  );

  const maxHours = useMemo(
    () => Math.max(...(weekHours || []).map((d) => d.hours), 1),
    [weekHours]
  );

  const visibleRequests = useMemo(() => {
    const all = (bookingsData?.data || []).map((b) => {
      const statusLabel =
        b.status === "PENDING" ? "En attente" :
        b.status === "CONFIRMED" ? "Acceptée" :
        b.status === "CANCELLED" ? "Refusée" :
        b.status === "COMPLETED" ? "Terminée" : "Annulée";

      let category: FilterCategory = "normal";
      if (b.status === "CONFIRMED") category = "accepted";
      else if (b.status === "CANCELLED") category = "rejected";
      else if (b.status === "PENDING") category = "normal";

      const duration = b.service?.duration ? `${Math.round(b.service.duration / 60)}h` : "";
      const date = b.timeSlot?.startTime
        ? new Date(b.timeSlot.startTime).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
        : undefined;

      const weekDayIndex = b.createdAt ? new Date(b.createdAt).getDay() : -1;
      const isWeekend = weekDayIndex === 0 || weekDayIndex === 6;

      if (isWeekend) category = "normal";

      return {
        id: b.id,
        name: `${b.client?.firstName || ""} ${b.client?.lastName || ""}`.trim() || "Client",
        avatar: b.client?.avatar,
        service: b.service?.name || "Service",
        duration,
        location: b.notes || undefined,
        date,
        urgent: false,
        category,
        statusLabel,
        showActions: b.status === "PENDING",
        icon: undefined as string | undefined,
      };
    });

    if (currentFilter === "all") return all;
    return all.filter((r) => r.category === currentFilter);
  }, [bookingsData, currentFilter]);

  const todayCount = useMemo(
    () => (bookingsData?.data || []).filter((b) => {
      if (!b.createdAt) return false;
      const today = new Date();
      const created = new Date(b.createdAt);
      return created.toDateString() === today.toDateString();
    }).length,
    [bookingsData]
  );

  const firstName = user?.firstName || "Alexandre";

  return (
    <ProviderLayout>
      <main className="flex-1 w-full max-w-container-max mx-auto p-margin-mobile md:p-margin-desktop pb-32 md:pb-margin-desktop space-y-12">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md">
          <div>
            <h2 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary mb-2">Bonjour, {firstName} !</h2>
            <p className="font-body-lg text-body-lg text-outline">
              Voici l'état de votre activité aujourd'hui. Vous avez{" "}
              <span className="font-bold text-secondary">{statsLoading ? "..." : stats?.bookingsCount || 0} mission{stats?.bookingsCount !== 1 ? "s" : ""}</span>{" "}
              prévue{stats?.bookingsCount !== 1 ? "s" : ""}.
            </p>
          </div>
          <div className="flex items-center gap-2 relative">
            <button
              className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-button text-button text-on-surface hover:border-secondary hover:text-secondary transition-ambient flex items-center gap-2"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              Filtrer
            </button>
            {filterOpen && (
              <div className="absolute right-0 mt-2 top-full w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden transition-all duration-300">
                <div className="p-2 flex flex-col gap-1">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setCurrentFilter(opt.value); setFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2 rounded-lg hover:bg-secondary/10 font-label-md transition-colors ${currentFilter === opt.value ? "bg-secondary/10 text-secondary" : "text-on-surface"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {[
            {
              label: "Missions du jour",
              value: statsLoading ? "..." : `${todayCount}`,
              icon: "schedule",
              footer: statsLoading ? "" : `${todayBookings.length} en attente`,
              footerIcon: "hourglass_top",
            },
            {
              label: "Revenus du mois",
              value: statsLoading ? "..." : `${(stats?.monthlyRevenue || 0).toLocaleString("fr-FR")} €`,
              icon: "account_balance_wallet",
              footer: statsLoading ? "" : `${stats && stats.revenueChange >= 0 ? "+" : ""}${stats?.revenueChange || 0}% vs mois dernier`,
              footerIcon: stats?.revenueChange && stats.revenueChange >= 0 ? "trending_up" : "trending_down",
            },
            {
              label: "Note moyenne",
              value: statsLoading ? "..." : `${(stats?.averageRating || 0).toFixed(1)}`,
              icon: "star",
              rating: true,
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface-container-lowest rounded-xl p-gutter ambient-shadow-base hover:ambient-shadow-hover transition-ambient flex flex-col justify-between border border-outline-variant/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="font-label-md text-label-md text-outline uppercase tracking-wider mb-1">{stat.label}</p>
                  {"rating" in stat && stat.rating ? (
                    <div className="flex items-end gap-2">
                      <h3 className="font-headline-lg text-headline-lg text-primary">{stat.value}</h3>
                      <span className="font-body-md text-outline mb-1">/ 5</span>
                    </div>
                  ) : (
                    <h3 className="font-headline-lg text-headline-lg text-primary">{stat.value}</h3>
                  )}
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined" style={(stat as { icon: string }).icon === "star" ? { fontVariationSettings: "'FILL' 1" } : undefined}>{(stat as { icon: string }).icon}</span>
                </div>
              </div>
              {"rating" in stat && stat.rating ? (
                <div className="flex items-center gap-1 text-secondary">
                  {[1, 2, 3, 4].map((i) => (
                    <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                  <span className="material-symbols-outlined text-sm">star_half</span>
                  <span className="text-sm font-medium ml-2 text-outline">({stats?.reviewCount || 0} avis)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-secondary font-medium">
                  <span className="material-symbols-outlined text-sm">{(stat as { footerIcon: string }).footerIcon}</span>
                  <span>{(stat as { footer: string }).footer}</span>
                </div>
              )}
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <section className="lg:col-span-8 space-y-stack-md">
            <div className="flex justify-between items-center border-b border-outline-variant/50 pb-4">
              <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">hourglass_top</span>
                Demandes en attente
              </h3>
              <button className="font-button text-button text-secondary hover:underline" onClick={() => navigate("/provider/planning")}>Voir tout</button>
            </div>
            <div className="space-y-4">
              {bookingsLoading ? (
                <div className="text-center py-8 text-outline">
                  <span className="material-symbols-outlined animate-spin inline-block">progress_activity</span>
                  <p className="mt-2">Chargement des demandes...</p>
                </div>
              ) : visibleRequests.length === 0 ? (
                <div className="text-center py-8 text-outline">
                  <span className="material-symbols-outlined text-3xl">inbox</span>
                  <p className="mt-2">Aucune demande pour le moment</p>
                </div>
              ) : (
                visibleRequests.map((req, i) => (
                  <ProviderRequestCard
                    key={req.id || `${req.name}-${i}`}
                    {...req}
                    onAccept={(id) => updateStatus.mutate({ id, status: "CONFIRMED" })}
                    onReject={(id) => updateStatus.mutate({ id, status: "CANCELLED" })}
                    acceptPending={updateStatus.isPending}
                    rejectPending={updateStatus.isPending}
                  />
                ))
              )}
            </div>
          </section>

          <section className="lg:col-span-4 space-y-stack-md mt-8 lg:mt-0">
            <div className="flex justify-between items-center border-b border-outline-variant/50 pb-4">
              <h3 className="font-headline-md text-headline-md text-primary">Performance hebdo</h3>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-gutter border border-outline-variant ambient-shadow-base">
              <div className="mb-6">
                <span className="font-label-md text-label-md text-outline uppercase tracking-wider">Heures facturées</span>
                <div className="flex items-end gap-2 mt-1">
                  <h4 className="font-headline-lg text-headline-lg text-primary">{weekLoading ? "..." : `${(weekHours || []).reduce((s, d) => s + d.hours, 0)}h`}</h4>
                  <span className="text-sm text-secondary font-medium mb-1">
                    ce mois-ci
                  </span>
                </div>
              </div>
              <div className="flex items-end justify-between h-32 gap-2 mt-4 pt-4 border-t border-outline-variant/30">
                {(weekHours || Array.from({ length: 7 }, (_, i) => ({ day: dayLabels[i], hours: 0 }))).map((day) => {
                  const pct = maxHours > 0 ? (day.hours / maxHours) * 100 : 0;
                  const todayIdx = new Date().getDay();
                  const isToday = dayLabels[todayIdx === 0 ? 6 : todayIdx - 1] === day.day;
                  return (
                    <div key={day.day} className="flex flex-col items-center gap-2 w-full group cursor-pointer">
                      <div className="w-full bg-surface-container-high rounded-t-sm relative flex items-end overflow-hidden group-hover:bg-secondary/10 transition-colors" style={{ height: "100%" }}>
                        <div
                          className={`w-full rounded-t-sm transition-all duration-500 ${isToday ? "bg-on-secondary-fixed-variant" : "bg-secondary"}`}
                          style={{ height: `${Math.max(pct, 5)}%` }}
                          title={`${day.hours}h`}
                        />
                      </div>
                      <span className={`text-xs font-medium ${isToday ? "text-primary font-bold" : "text-outline group-hover:text-primary"}`}>{day.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>


          </section>
        </div>
      </main>
    </ProviderLayout>
  );
}
