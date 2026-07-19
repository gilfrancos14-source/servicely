import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, startOfDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, isBefore, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { getService, getAvailableSlots } from "@/services/bookingService";
import { createPayPalOrder, capturePayPalOrder } from "@/services/paymentService";
import { useAppSelector } from "@/hooks/useRedux";
import { formatSlotTime } from "@/lib/utils";

type Step = 1 | 2 | 3;

const WEEKDAYS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

function useCalendar() {
  const [viewMonth, setViewMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(viewMonth);
    const end = endOfMonth(viewMonth);
    const all = eachDayOfInterval({ start, end });
    const pad = (getDay(start) + 6) % 7;
    const result: (Date | null)[] = [];
    for (let i = 0; i < pad; i++) result.push(null);
    result.push(...all);
    return result;
  }, [viewMonth]);

  const today = startOfDay(new Date());

  const prevMonth = () => setViewMonth((m) => subMonths(m, 1));
  const nextMonth = () => setViewMonth((m) => addMonths(m, 1));

  return { days, viewMonth, prevMonth, nextMonth, today };
}

function CalendarView({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date | undefined;
  onSelect: (d: Date) => void;
}) {
  const { days, viewMonth, prevMonth, nextMonth, today } = useCalendar();

  return (
    <div className="p-4 border border-outline-variant rounded-xl bg-surface">
      <div className="flex justify-between items-center mb-4 px-2">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-surface-container rounded-full transition-all duration-300 ease-in-out"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <span className="font-bold">{format(viewMonth, "MMMM yyyy", { locale: fr })}</span>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-surface-container rounded-full transition-all duration-300 ease-in-out"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
      <div className="calendar-grid gap-1 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] uppercase font-bold text-outline">
            {d}
          </div>
        ))}
      </div>
      <div className="calendar-grid gap-1">
        {days.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} />;
          }
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isBeforeToday = isBefore(day, today) && !isToday(day);
          const isCurrentMonth = isSameMonth(day, viewMonth);

          if (!isCurrentMonth) {
            return (
              <div
                key={day.toISOString()}
                className="aspect-square flex items-center justify-center text-sm text-outline-variant opacity-40"
              >
                {format(day, "d")}
              </div>
            );
          }

          if (isBeforeToday) {
            return (
              <div
                key={day.toISOString()}
                className="aspect-square flex items-center justify-center text-sm text-outline-variant opacity-40"
              >
                {format(day, "d")}
              </div>
            );
          }

          if (isSelected) {
            return (
              <div
                key={day.toISOString()}
                className="aspect-square flex items-center justify-center text-sm bg-secondary text-on-secondary rounded-lg font-bold pulse-selected shadow-lg"
              >
                {format(day, "d")}
              </div>
            );
          }

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelect(day)}
              className="aspect-square flex items-center justify-center text-sm hover:bg-secondary-container/30 hover:scale-110 hover:shadow-sm cursor-pointer rounded-lg transition-all duration-300 ease-in-out"
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"paypal">("paypal");
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [paypalLoading, setPaypalLoading] = useState(false);

  const { data: service, isLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: () => getService(id!),
    enabled: !!id,
  });

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  const currentUser = useAppSelector((state) => state.auth.user);

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ["timeslots", service?.providerId, service?.id, dateStr],
    queryFn: () => getAvailableSlots(service!.providerId, service!.id, dateStr),
    enabled: !!service && !!selectedDate,
  });

  const handlePayPalApprove = useCallback(async (orderId: string) => {
    setPaypalError(null);
    setPaypalLoading(true);
    try {
      await capturePayPalOrder(orderId, {
        serviceId: service!.id,
        providerId: service!.providerId,
        startTime: selectedSlot!.startTime,
        endTime: selectedSlot!.endTime,
        notes: notes || undefined,
      });
      setStep(3);
      setTimeout(() => {
        const el = document.getElementById("success-icon");
        if (el) {
          el.style.transform = "scale(1.4)";
          el.style.transition = "transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.4)";
        }
      }, 400);
    } catch (err: any) {
      console.error("PayPal capture error:", err);
      setPaypalError(err?.response?.data?.error?.message || "Le paiement a échoué. Veuillez réessayer.");
    } finally {
      setPaypalLoading(false);
    }
  }, [service, selectedSlot, notes]);

  const handlePayPalCreateOrder = useCallback(async () => {
    if (!service) throw new Error("Service introuvable");
    setPaypalLoading(true);
    try {
      const { orderId } = await createPayPalOrder(Number(service.price), service.id);
      return orderId;
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || err?.message || "Échec de création de la commande PayPal";
      setPaypalError(message);
      throw new Error(message);
    } finally {
      setPaypalLoading(false);
    }
  }, [service]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-margin-mobile">
        <span className="material-symbols-outlined text-6xl text-outline-variant">search_off</span>
        <h1 className="font-headline-lg text-headline-lg text-primary">Service introuvable</h1>
        <Link to="/services">
          <button className="px-6 py-3 border border-secondary text-secondary rounded-lg font-button hover:bg-secondary/5 transition-all">
            Retour aux services
          </button>
        </Link>
      </div>
    );
  }

  const provider = service.provider ?? null;
  const totalPrice = Number(service.price);
  const serviceFee = totalPrice * 0.05;

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md">
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-section-gap">
        {/* Stepper */}
        <div className="flex justify-between items-center max-w-2xl mx-auto mb-12 relative animate-entrance stagger-1">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-outline-variant -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-secondary -translate-y-1/2 z-0 transition-all duration-700 ease-in-out"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
          {([1, 2, 3] as const).map((s) => {
            const isCompleted = step > s;
            const isCurrent = step === s;
            return (
              <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ease-in-out ${
                    isCompleted || isCurrent
                      ? "bg-secondary text-on-secondary border-secondary"
                      : "bg-surface-container-highest text-outline border-outline-variant"
                  } ${isCurrent ? "scale-in-custom" : ""}`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-sm">check</span>
                  ) : (
                    s
                  )}
                </div>
                <span
                  className={`font-label-md text-label-md ${
                    isCompleted || isCurrent ? "text-secondary font-bold" : "text-on-surface-variant"
                  }`}
                >
                  {s === 1 ? "Date & Créneau" : s === 2 ? "Confirmation" : "Succès"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Main Flow Canvas */}
          <div className="lg:col-span-8 space-y-gutter">
            {/* Step 1: Date & Time */}
            <div className={`step-fade ${step === 1 ? "" : "hidden-step"} space-y-gutter animate-entrance stagger-2`}>
              <div className="bg-surface-container-lowest rounded-xl p-8 card-lift">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
                  <h2 className="font-headline-md text-headline-md">Choisir une date</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <CalendarView
                    selectedDate={selectedDate}
                    onSelect={(d) => {
                      setSelectedDate(d);
                      setSelectedSlot(null);
                    }}
                  />
                  <div className="space-y-6 animate-entrance stagger-3">
                    <div>
                      <p className="font-label-md text-label-md text-outline uppercase mb-3">Matin</p>
                      <div className="grid grid-cols-3 gap-2">
                        {slotsLoading ? (
                          <div className="col-span-3 flex justify-center py-4">
                            <div className="animate-spin h-5 w-5 border-2 border-secondary border-t-transparent rounded-full" />
                          </div>
                        ) : slots && slots.morning.length > 0 ? (
                          slots.morning.map((slot) => {
                            const time = formatSlotTime(slot.startTime);
                            const isSelected = selectedSlot?.startTime === slot.startTime;
                            return (
                              <button
                                key={slot.startTime}
                                onClick={() => setSelectedSlot(slot)}
                                className={`py-2 rounded-lg text-sm transition-all duration-300 ease-in-out active:scale-95 ${
                                  isSelected
                                    ? "border-2 border-secondary bg-secondary/5 text-secondary font-bold scale-105 shadow-sm"
                                    : "border border-outline-variant hover:border-secondary hover:bg-secondary/5 hover:scale-105"
                                }`}
                              >
                                {time}
                              </button>
                            );
                          })
                        ) : (
                          <p className="col-span-3 text-sm text-outline text-center py-4">
                            {selectedDate ? "Aucun créneau disponible" : "Sélectionnez une date"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-outline uppercase mb-3">Après-midi</p>
                      <div className="grid grid-cols-3 gap-2">
                        {slotsLoading ? (
                          <div className="col-span-3 flex justify-center py-4">
                            <div className="animate-spin h-5 w-5 border-2 border-secondary border-t-transparent rounded-full" />
                          </div>
                        ) : slots && slots.afternoon.length > 0 ? (
                          slots.afternoon.map((slot) => {
                            const time = formatSlotTime(slot.startTime);
                            const isSelected = selectedSlot?.startTime === slot.startTime;
                            return (
                              <button
                                key={slot.startTime}
                                onClick={() => setSelectedSlot(slot)}
                                className={`py-2 rounded-lg text-sm transition-all duration-300 ease-in-out active:scale-95 ${
                                  isSelected
                                    ? "border-2 border-secondary bg-secondary/5 text-secondary font-bold scale-105 shadow-sm"
                                    : "border border-outline-variant hover:border-secondary hover:bg-secondary/5 hover:scale-105"
                                }`}
                              >
                                {time}
                              </button>
                            );
                          })
                        ) : (
                          <p className="col-span-3 text-sm text-outline text-center py-4">
                            {selectedDate ? "Aucun créneau disponible" : "Sélectionnez une date"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end py-6" id="flow-actions-step1">
                <button
                  disabled={!selectedDate || !selectedSlot}
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-10 py-3 bg-secondary text-on-secondary rounded-lg font-button shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out btn-shimmer group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Suivant</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Step 2: Confirmation + Payment */}
            <div className={`step-fade ${step === 2 ? "" : "hidden-step"} space-y-gutter animate-entrance`}>
              <div className="bg-surface-container-lowest rounded-xl p-8 card-lift">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  <h2 className="font-headline-md text-headline-md">Détails de facturation</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="font-label-md text-label-md text-outline uppercase block mb-1">Nom complet</label>
                      <input
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all duration-300 ease-in-out"
                        type="text"
                        value={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : ""}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="font-label-md text-label-md text-outline uppercase block mb-1">Email</label>
                      <input
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all duration-300 ease-in-out"
                        type="email"
                        value={currentUser?.email || ""}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="font-label-md text-label-md text-outline uppercase block mb-1">Instructions spéciales</label>
                      <textarea
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all duration-300 ease-in-out resize-none"
                        placeholder="Ajoutez des détails pour le professionnel..."
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-outline-variant">
                  <h3 className="font-bold mb-4">Paiement sécurisé</h3>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <label
                      className={`flex-1 p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-all duration-300 ease-in-out ${
                        paymentMethod === "paypal"
                          ? "border-2 border-secondary bg-secondary/5"
                          : "border border-outline-variant hover:border-secondary hover:bg-secondary/5"
                      } ${paymentMethod === "paypal" ? "" : "hover:scale-[1.02]"}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "paypal"}
                        onChange={() => setPaymentMethod("paypal")}
                        className="text-secondary focus:ring-secondary"
                      />
                      <span className="material-symbols-outlined">payments</span>
                      <span className="font-bold">PayPal</span>
                    </label>
                  </div>
                  {import.meta.env.VITE_PAYPAL_CLIENT_ID && import.meta.env.VITE_PAYPAL_CLIENT_ID !== "placeholder-paypal-client-id" ? (
                    <PayPalScriptProvider
                      options={{
                        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
                        currency: "EUR",
                        intent: "capture",
                      }}
                    >
                      {step === 2 && (
                        paypalLoading ? (
                          <div className="flex items-center justify-center py-8 gap-3">
                            <div className="animate-spin h-6 w-6 border-2 border-secondary border-t-transparent rounded-full" />
                            <span className="text-sm text-outline">Traitement du paiement...</span>
                          </div>
                        ) : (
                          <PayPalButtons
                            fundingSource="paypal"
                            style={{ layout: "vertical", shape: "rect" }}
                            createOrder={handlePayPalCreateOrder}
                            onApprove={async (data) => {
                              await handlePayPalApprove(data.orderID);
                            }}
                            onError={(err: unknown) => {
                              console.error("PayPal SDK error:", err);
                              const message = err instanceof Error ? err.message : "Une erreur PayPal est survenue.";
                              setPaypalError(message);
                            }}
                          />
                        )
                      )}
                    </PayPalScriptProvider>
                  ) : (
                    <p className="text-sm text-outline">Configurez les clés PayPal dans <code>.env</code> pour activer le paiement.</p>
                  )}
                  {paypalError && (
                    <p className="mt-3 text-sm text-error">{paypalError}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-start py-6" id="flow-actions-step2">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-6 py-3 text-secondary font-button transition-all duration-300 ease-in-out"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Retour
                </button>
              </div>
            </div>

            {/* Step 3: Success */}
            <div className={`step-fade ${step === 3 ? "" : "hidden-step"}`}>
              <div className="bg-surface-container-lowest rounded-xl p-12 text-center card-lift border-t-4 border-secondary overflow-hidden">
                <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 scale-in-custom">
                  <span
                    className="material-symbols-outlined text-secondary text-4xl"
                    id="success-icon"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                </div>
                <h2 className="font-headline-lg text-headline-lg mb-4 animate-entrance stagger-1">Réservation confirmée !</h2>
                <p className="text-body-lg text-on-surface-variant max-w-md mx-auto mb-8 animate-entrance stagger-2">
                  Votre rendez-vous avec <span className="font-bold">{provider?.user?.firstName ?? ""} {provider?.user?.lastName ?? ""}</span>{" "}
                  est programmé pour le{" "}
                  <span className="font-bold">
                    {selectedDate ? format(selectedDate, "d MMM yyyy", { locale: fr }) : ""} à {selectedSlot ? formatSlotTime(selectedSlot.startTime) : ""}
                  </span>.
                </p>
                <p className="text-sm text-on-surface-variant mb-8 animate-entrance stagger-2">
                  Un email de confirmation vous a été envoyé.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-entrance stagger-3">
                  <button
                    className="px-8 py-3 bg-secondary text-on-secondary rounded-lg font-button shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out btn-shimmer"
                    onClick={() => navigate("/dashboard")}
                  >
                    Voir mes réservations
                  </button>
                  <button
                    className="px-8 py-3 border border-secondary text-secondary rounded-lg font-button hover:bg-secondary/5 hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out"
                    onClick={() => navigate("/services")}
                  >
                    Explorer d'autres services
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Side Summary */}
          <aside className="lg:col-span-4 sticky top-24 animate-entrance stagger-4">
            <div className="bg-surface-container-lowest rounded-xl p-6 card-lift space-y-6 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 ease-in-out">
              <div>
                <h3 className="font-headline-md text-headline-md mb-4">Récapitulatif</h3>
                <div className="flex gap-4 items-center p-3 bg-surface rounded-lg transition-colors duration-300">
                  <div
                    className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0 shadow-sm bg-surface-container-high flex items-center justify-center overflow-hidden"
                  >
                    {service.imageUrl ? (
                      <img src={service.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-outline/30 text-lg">{service.name?.charAt(0) ?? ""}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold">{service.name}</p>
                    <p className="text-sm text-on-surface-variant">Durée : {service.duration} min</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center group cursor-default">
                  <span className="flex items-center gap-2 text-on-surface-variant transition-colors duration-300 group-hover:text-secondary">
                    <span className="material-symbols-outlined text-sm">person</span> Pro
                  </span>
                  <span className="font-medium">{provider?.user?.firstName ?? ""} {provider?.user?.lastName ?? ""}</span>
                </div>
                <div className="flex justify-between items-center group cursor-default">
                  <span className="flex items-center gap-2 text-on-surface-variant transition-colors duration-300 group-hover:text-secondary">
                    <span className="material-symbols-outlined text-sm">event</span> Date
                  </span>
                  <span className="font-medium" id="summary-date">
                    {selectedDate ? format(selectedDate, "d MMM yyyy", { locale: fr }) : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center group cursor-default">
                  <span className="flex items-center gap-2 text-on-surface-variant transition-colors duration-300 group-hover:text-secondary">
                    <span className="material-symbols-outlined text-sm">schedule</span> Créneau
                  </span>
                  <span className="font-medium" id="summary-time">
                    {selectedSlot ? formatSlotTime(selectedSlot.startTime) : "—"}
                  </span>
                </div>
              </div>
              <div className="pt-6 border-t border-outline-variant space-y-3">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Sous-total</span>
                  <span>{totalPrice.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Frais de service</span>
                  <span>{serviceFee.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-headline-md font-bold text-secondary pt-2 scale-in-custom stagger-4">
                  <span>Total</span>
                  <span>{(totalPrice + serviceFee).toFixed(2)} €</span>
                </div>
              </div>
              <div className="bg-secondary-container/20 p-4 rounded-lg flex gap-3 animate-pulse-soft">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <p className="text-xs leading-relaxed text-on-secondary-container">
                  Paiement sécurisé avec garantie de satisfaction Servicely.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
