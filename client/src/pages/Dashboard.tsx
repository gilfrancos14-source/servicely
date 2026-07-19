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
import { useAppSelector } from "@/hooks/useRedux";
import type { Booking } from "@/types";
import { getServiceIcon, formatBookingDate, getStatusLabel, getStatusStyle } from "@/lib/utils";

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

export function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const firstName = user?.firstName || "Utilisateur";

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings", "CONFIRMED"],
    queryFn: () => getMyBookings({ status: "CONFIRMED" }),
  });

  const confirmedBookings = bookings?.length ?? 0;

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
              title="RÉSERVATIONS À VENIR"
              value={<AnimatedNumber value={confirmedBookings} />}
              subtitle="Confirmées"
              icon="fact_check"
              delay={0.2}
              trending={confirmedBookings > 0}
            />
            <StatsCard
              title="SERVICES DISPONIBLES"
              value={<AnimatedNumber value={8} />}
              subtitle="Sur la plateforme"
              icon="autorenew"
              delay={0.3}
            />
            <StatsCard
              title="STATUT"
              value="Actif"
              suffix=""
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
