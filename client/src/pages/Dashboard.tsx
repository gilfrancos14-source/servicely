import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AppointmentItem } from "@/components/dashboard/AppointmentItem";
import { QuickActionItem } from "@/components/dashboard/QuickActionItem";
import { getMyBookings } from "@/services/bookingService";
import type { Booking } from "@/types";

function useCountUp(target: number, duration: number): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const startTime = performance.now();
    let rafId: number;
    function update(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(update);
      }
    }
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);
  return count;
}

function AnimatedNumber({ value, suffix }: { value: number; suffix?: string }) {
  const count = useCountUp(value, 1500);
  return <>{count.toLocaleString("fr-FR")}{suffix}</>;
}

const user = JSON.parse(localStorage.getItem("user") || "null");
const firstName = user?.firstName || "Alex";

function getServiceIcon(serviceName?: string): string {
  const s = (serviceName || "").toLowerCase();
  if (s.includes("ménage") || s.includes("nettoyage") || s.includes("vitres")) return "cleaning_services";
  if (s.includes("jardin") || s.includes("pelouse") || s.includes("tonte") || s.includes("haie")) return "yard";
  if (s.includes("électric") || s.includes("luminaires") || s.includes("tableau")) return "electric_bolt";
  if (s.includes("plomb") || s.includes("robinet") || s.includes("canalisation") || s.includes("débouch")) return "plumbing";
  return "service_toolbox";
}

function formatBookingDate(startTime: string): string {
  const d = new Date(startTime);
  return format(d, "d MMM, HH:mm", { locale: fr });
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    CONFIRMED: "Confirmé",
    PENDING: "En attente",
    COMPLETED: "Terminé",
    CANCELLED: "Annulé",
  };
  return map[status] || status;
}

function getStatusStyle(status: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    CONFIRMED: { bg: "bg-secondary-container", text: "text-on-secondary-container" },
    PENDING: { bg: "bg-primary-fixed", text: "text-on-primary-fixed" },
    COMPLETED: { bg: "bg-surface-container-highest", text: "text-on-surface-variant" },
    CANCELLED: { bg: "bg-error-container", text: "text-on-error-container" },
  };
  return map[status] || { bg: "bg-surface-container-highest", text: "text-on-surface-variant" };
}

export function DashboardPage() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings", "CONFIRMED"],
    queryFn: () => getMyBookings({ status: "CONFIRMED" }),
  });

  return (
    <div className="bg-background text-on-surface font-body-md h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col md:ml-64 h-screen overflow-y-auto bg-surface">
        <TopBar />
        <div className="px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto w-full flex-1 flex flex-col gap-stack-lg">
          <section className="flex flex-col gap-stack-sm animate-entrance" style={{ animationDelay: "0.1s" }}>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary tracking-tight">
              Bonjour {firstName} ! Ravi de vous revoir.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Voici un aperçu rapide de vos activités.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <StatsCard
              title="RÉSERVATIONS TOTALES"
              value={<AnimatedNumber value={24} />}
              subtitle="+3 ce mois-ci"
              icon="fact_check"
              delay={0.2}
              trending
            />
            <StatsCard
              title="SERVICES ACTIFS"
              value={<AnimatedNumber value={2} />}
              subtitle="En cours actuellement"
              icon="autorenew"
              delay={0.3}
            />
            <StatsCard
              title="POINTS DE FIDÉLITÉ"
              value={<AnimatedNumber value={1450} />}
              subtitle="Statut Membre Élite"
              icon="stars"
              delay={0.4}
            />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            <section className="lg:col-span-8 flex flex-col gap-stack-md animate-entrance" style={{ animationDelay: "0.5s" }}>
              <div className="flex justify-between items-end">
                <h2 className="font-headline-md text-headline-md text-primary">Rendez-vous à venir</h2>
                <Link to="/services" className="font-button text-button text-secondary hover:underline transition-premium">Voir tout</Link>
              </div>
              <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-surface-variant p-6 flex flex-col gap-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin h-6 w-6 border-2 border-secondary border-t-transparent rounded-full" />
                  </div>
                ) : !bookings || bookings.length === 0 ? (
                  <p className="text-on-surface-variant text-center py-8">Aucun rendez-vous à venir.</p>
                ) : (
                  bookings.map((booking: Booking) => {
                    const style = getStatusStyle(booking.status);
                    const icon = getServiceIcon(booking.service?.name);
                    return (
                      <AppointmentItem
                        key={booking.id}
                        icon={icon}
                        iconBg="bg-secondary-container"
                        iconColor="text-on-secondary-container"
                        title={booking.service?.name || "Service"}
                        provider={`${booking.provider?.user?.firstName || ""} ${booking.provider?.user?.lastName || ""}`}
                        date={formatBookingDate(booking.timeSlot?.startTime || booking.createdAt)}
                        status={getStatusLabel(booking.status)}
                        statusBg={style.bg}
                        statusText={style.text}
                      />
                    );
                  })
                )}
              </div>
            </section>

            <section className="lg:col-span-4 flex flex-col gap-stack-md animate-entrance" style={{ animationDelay: "0.6s" }}>
              <h2 className="font-headline-md text-headline-md text-primary">Actions Rapides</h2>
              <div className="grid grid-cols-2 gap-4">
                <QuickActionItem icon="cleaning_services" label="Ménage" to="/services?search=Ménage" />
                <QuickActionItem icon="yard" label="Jardinage" to="/services?search=Jardinage" />
                <QuickActionItem icon="electric_bolt" label="Électricien" to="/services?search=Électricien" />
                <QuickActionItem icon="search" label="Tout explorer" variant="explore" to="/services" />
              </div>
            </section>
          </div>
          <div className="h-8" />
        </div>
      </main>
    </div>
  );
}
