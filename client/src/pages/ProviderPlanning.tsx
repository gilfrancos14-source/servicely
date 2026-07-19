import { useMemo, useState, useRef } from "react";
import { ProviderLayout } from "@/components/prestataire/ProviderLayout";
import { ProviderPlanningCard } from "@/components/prestataire/ProviderPlanningCard";
import { useProviderBookings } from "@/hooks/useProviderQueries";

export function ProviderPlanning() {
  const { data: bookingsData, isLoading } = useProviderBookings({ limit: 50 });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const dateInputRef = useRef<HTMLInputElement>(null);

  const { selectedItems, nextItems, summary } = useMemo(() => {
    const day = new Date(selectedDate);
    const isToday = day.toDateString() === new Date().toDateString();

    const dayStr = day.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }).replace(/^\w/, (c) => c.toUpperCase());
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const nextStr = next.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }).replace(/^\w/, (c) => c.toUpperCase());

    const bookDate = day.toDateString();
    const nextDate = next.toDateString();

    const selectedItems: ReturnType<typeof renderBookingCard>[] = [];
    const nextItems: ReturnType<typeof renderBookingCard>[] = [];
    let missionsCount = 0;
    let totalEstHours = 0;
    let totalEstEarnings = 0;

    const bookings = bookingsData?.data || [];
    for (const b of bookings) {
      const start = b.timeSlot?.startTime ? new Date(b.timeSlot.startTime) : null;
      if (!start) continue;

      const startDay = start.toDateString();
      const card = renderBookingCard(b);

      if (startDay === bookDate) {
        selectedItems.push(card);
        missionsCount++;
        if (b.service?.duration) {
          totalEstHours += b.service.duration / 60;
        }
        totalEstEarnings += b.totalPrice || 0;
      } else if (startDay === nextDate) {
        nextItems.push(card);
      }
    }

    return {
      selectedItems,
      nextItems,
      summary: { missionsCount, totalEstHours, totalEstEarnings, dayStr, nextStr, isToday },
    };
  }, [bookingsData, selectedDate]);

  if (isLoading) {
    return (
      <ProviderLayout>
        <main className="flex-1 p-margin-mobile md:p-margin-desktop bg-background overflow-y-auto flex items-center justify-center">
          <div className="text-outline text-center">
            <span className="material-symbols-outlined animate-spin text-3xl inline-block">progress_activity</span>
            <p className="mt-4">Chargement du planning...</p>
          </div>
        </main>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <main className="flex-1 p-margin-mobile md:p-margin-desktop bg-background overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-section-gap gap-stack-md">
          <div>
            <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary mb-stack-sm">Mon Planning</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Gérez vos interventions et suivez vos missions de la semaine.</p>
          </div>
          <div className="flex items-center gap-stack-sm">
            <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant">
              <button className="px-stack-md py-stack-sm rounded-md bg-surface shadow-sm text-secondary font-button text-button flex items-center gap-stack-sm transition-all">
                <span className="material-symbols-outlined">view_list</span>
                Liste
              </button>
              <button
                onClick={() => dateInputRef.current?.showPicker()}
                className="px-stack-md py-stack-sm rounded-md text-on-surface-variant font-button text-button flex items-center gap-stack-sm hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined">calendar_month</span>
                Calendrier
              </button>
            </div>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate.toISOString().split("T")[0]}
              onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value + "T00:00:00"))}
              className="w-0 h-0 opacity-0 absolute pointer-events-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8 flex flex-col gap-stack-lg">
            <div className="flex items-center gap-stack-md">
              <h2 className="font-headline-md text-headline-md text-primary">{summary.isToday ? "Aujourd'hui" : summary.dayStr}</h2>
              <div className="h-px bg-outline-variant flex-grow" />
              <span className="font-label-md text-label-md text-on-surface-variant">{summary.dayStr}</span>
            </div>

            {selectedItems.length === 0 ? (
              <div className="text-center py-12 text-outline bg-surface-container-lowest rounded-xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-3xl">event_busy</span>
                <p className="mt-2">Aucune mission ce jour</p>
              </div>
            ) : (
              selectedItems
            )}

            <div className="flex items-center gap-stack-md mt-section-gap opacity-50">
              <h2 className="font-headline-md text-headline-md text-on-surface-variant">{summary.isToday ? "Demain" : "Jour suivant"}</h2>
              <div className="h-px bg-outline-variant flex-grow" />
              <span className="font-label-md text-label-md text-on-surface-variant">{summary.nextStr}</span>
            </div>

            {nextItems.length === 0 ? (
              <div className="text-center py-12 text-outline bg-surface-container-lowest rounded-xl border border-outline-variant/30 opacity-50">
                <span className="material-symbols-outlined text-3xl">event_note</span>
                <p className="mt-2">Aucune mission</p>
              </div>
            ) : (
              <div className="opacity-50">{nextItems}</div>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-stack-lg">
            <div className="bg-primary-container text-on-primary-container p-gutter rounded-xl shadow-sm">
              <h3 className="font-headline-md text-headline-md mb-stack-md text-on-primary-fixed">Résumé du jour</h3>
              <div className="grid grid-cols-2 gap-stack-md mb-stack-md">
                <div className="bg-surface p-stack-sm rounded-lg text-center">
                  <span className="block font-headline-lg text-headline-lg text-primary">{summary.missionsCount}</span>
                  <span className="font-label-md text-label-md text-on-surface-variant">Missions</span>
                </div>
                <div className="bg-surface p-stack-sm rounded-lg text-center">
                  <span className="block font-headline-lg text-headline-lg text-secondary">{summary.totalEstHours.toFixed(1)}h</span>
                  <span className="font-label-md text-label-md text-on-surface-variant">Estimées</span>
                </div>
              </div>
              <div className="bg-secondary-container p-stack-sm rounded-lg flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-secondary-container font-bold">Gains estimés</span>
                <span className="font-headline-md text-headline-md text-on-secondary-container">{summary.totalEstEarnings.toFixed(0).replace(".", ",")}€</span>
              </div>
            </div>

            <div className="glass-card rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="p-stack-md border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-headline-md text-headline-md text-primary">Carte des trajets</h3>
                <button className="text-secondary font-label-md text-label-md hover:underline">Agrandir</button>
              </div>
              <div className="h-64 bg-surface-container-high relative flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-outline opacity-30">map</span>
                <p className="absolute bottom-4 text-xs text-outline">Carte des trajets — basée sur vos adresses d'intervention</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProviderLayout>
  );
}

function renderBookingCard(booking: NonNullable<ReturnType<typeof useProviderBookings>["data"]>["data"][0]) {
  const start = booking.timeSlot?.startTime ? new Date(booking.timeSlot.startTime) : null;
  const end = booking.timeSlot?.endTime ? new Date(booking.timeSlot.endTime) : null;
  const startTime = start ? `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}` : "??:??";
  const endTime = end ? `${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}` : "??:??";

  const now = new Date();
  const isOngoing = start && start <= now && end && end >= now;
  const isPast = end && end < now;

  const status: "en_cours" | "a_venir" | "termine" = isPast ? "termine" : isOngoing ? "en_cours" : "a_venir";

  const actions = [
    { label: "Itinéraire", icon: "map" as const, variant: "ghost" as const },
    ...(status !== "termine" ? [{ label: "Contacter" as const, icon: "phone" as const, variant: "outline" as const }] : []),
  ];

  return (
    <ProviderPlanningCard
      key={booking.id}
      startTime={startTime}
      endTime={endTime}
      status={status}
      title={booking.service?.name || "Mission"}
      icon={booking.service?.category?.icon || "handyman"}
      clientName={`${booking.client?.firstName || ""} ${booking.client?.lastName || ""}`.trim() || "Client"}
      address={booking.notes || undefined}
      actions={actions}
    />
  );
}
