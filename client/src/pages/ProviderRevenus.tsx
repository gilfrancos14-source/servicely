import { useMemo, useState } from "react";
import { ProviderLayout } from "@/components/prestataire/ProviderLayout";
import { ProviderTransactionCard } from "@/components/prestataire/ProviderTransactionCard";
import { useProviderEarnings, useProviderWeeklyHours } from "@/hooks/useProviderQueries";

export function ProviderRevenus() {
  const [limit, setLimit] = useState(10);
  const { data: earningsData, isLoading: earningsLoading } = useProviderEarnings({ page: 1, limit });
  const { data: dailyEarnings, isLoading: dailyLoading } = useProviderEarnings({ days: 30 });
  const { data: weekHours } = useProviderWeeklyHours();

  const totalEarnings30 = useMemo(
    () => {
      if (!dailyEarnings?.data) return 0;
      return (dailyEarnings.data as { date: string; amount: number }[]).reduce((sum, d) => sum + d.amount, 0);
    },
    [dailyEarnings]
  );

  const maxEarning = useMemo(
    () => {
      if (!dailyEarnings?.data) return 1;
      return Math.max(...(dailyEarnings.data as { date: string; amount: number }[]).map((d) => d.amount), 1);
    },
    [dailyEarnings]
  );

  const chartBars = useMemo(() => {
    if (!dailyEarnings?.data) return [];
    return (dailyEarnings.data as { date: string; amount: number }[]).map((d) => ({
      height: `${Math.max((d.amount / maxEarning) * 100, 3)}%`,
      title: `${d.amount.toFixed(2)} €`,
      today: new Date(d.date).toDateString() === new Date().toDateString(),
      highlighted: false,
    }));
  }, [dailyEarnings, maxEarning]);

  const transactions = useMemo(() => {
    if (!earningsData?.data) return [];
    return (earningsData.data as { id: string; amount: number; createdAt: string; booking: { id: string; service: { name: string }; client: { firstName: string; lastName: string } } }[]).map((e) => ({
      icon: "payments",
      title: e.booking?.service?.name || "Paiement reçu",
      subtitle: `Client: ${e.booking?.client?.firstName || ""} ${e.booking?.client?.lastName || ""}`.trim(),
      amount: `+ ${e.amount.toFixed(2).replace(".", ",")} €`,
      amountColor: "text-secondary" as const,
      date: new Date(e.createdAt).toLocaleDateString("fr-FR"),
    }));
  }, [earningsData]);

  const pendingAmount = useMemo(() => {
    if (!weekHours) return "0";
    const totalHours = weekHours.reduce((s, d) => s + d.hours, 0);
    const avgRate = totalEarnings30 > 0 && totalHours > 0 ? totalEarnings30 / totalHours : 50;
    return (totalHours * avgRate * 0.3).toFixed(2);
  }, [weekHours, totalEarnings30]);

  return (
    <ProviderLayout>
      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg md:py-section-gap">
        <div className="mb-stack-lg">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary tracking-tight">Vos Finances</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Suivez vos gains, analysez vos performances et gérez vos virements.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-section-gap">
          <div className="md:col-span-8 bg-surface rounded-xl ambient-shadow-base p-8 flex flex-col justify-between relative overflow-hidden group hover:ambient-shadow-hover transition-shadow duration-300 border border-outline-variant/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container opacity-20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:opacity-30 transition-opacity" />
            <div>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Solde disponible</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary font-bold">
                  {dailyLoading ? "..." : `${totalEarnings30.toFixed(2).replace(".", ",")}`}
                </span>
                <span className="font-headline-md text-headline-md text-on-surface-variant">€</span>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <button className="bg-secondary text-on-secondary font-button text-button px-6 py-3 rounded-lg ambient-shadow-base hover:ambient-shadow-hover hover:-translate-y-0.5 transition-all">
                Retirer l'argent
              </button>
              <span className="font-body-md text-body-md text-on-surface-variant text-sm">Virement sous 48h ouvrées</span>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col gap-gutter">
            <div className="bg-surface rounded-xl ambient-shadow-base p-6 border border-outline-variant/20 flex-1 flex flex-col justify-center">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Gains (30 jours)</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-headline-md text-headline-md text-primary font-bold">
                  {dailyLoading ? "..." : `${totalEarnings30.toFixed(2).replace(".", ",")} €`}
                </span>
                <span className="text-secondary bg-secondary-container/30 px-2 py-0.5 rounded text-xs font-medium flex items-center">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> +12%
                </span>
              </div>
            </div>
            <div className="bg-surface rounded-xl ambient-shadow-base p-6 border border-outline-variant/20 flex-1 flex flex-col justify-center">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">En cours de validation</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-headline-md text-headline-md text-on-surface-variant">{parseFloat(pendingAmount).toFixed(2).replace(".", ",")} €</span>
              </div>
              <p className="font-body-md text-body-md text-xs text-outline mt-2">Issus de {(earningsData?.data as unknown[])?.length || 0} missions récentes</p>
            </div>
          </div>
        </div>

        <div className="mb-section-gap bg-surface rounded-xl ambient-shadow-base p-8 border border-outline-variant/20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="font-headline-md text-headline-md text-primary">Évolution des gains</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Sur les 30 derniers jours</p>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-1 md:gap-2 border-b border-outline-variant/30 pb-2 relative">
            <div className="absolute w-full h-full pointer-events-none flex flex-col justify-between opacity-10">
              <div className="border-t border-primary w-full" />
              <div className="border-t border-primary w-full" />
              <div className="border-t border-primary w-full" />
              <div className="border-t border-primary w-full" />
            </div>
            {dailyLoading ? (
              <div className="w-full flex items-center justify-center text-outline">
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              </div>
            ) : chartBars.length === 0 ? (
              <div className="w-full text-center text-outline text-sm">Aucune donnée disponible</div>
            ) : (
              chartBars.map((bar, i) => (
                <div
                  key={i}
                  className={`w-full rounded-t-sm transition-colors cursor-pointer ${bar.today ? "bg-secondary" : bar.highlighted ? "bg-secondary/80" : "bg-secondary-container hover:bg-secondary"}`}
                  style={{ height: bar.height }}
                  title={bar.title}
                />
              ))
            )}
          </div>
          <div className="flex justify-between mt-2 font-label-md text-label-md text-outline text-xs">
            <span>Il y a 30j</span>
            <span>Aujourd'hui</span>
          </div>
        </div>

        <div>
          <h3 className="font-headline-md text-headline-md text-primary mb-6">Dernières transactions</h3>
          <div className="flex flex-col gap-3">
            {earningsLoading ? (
              <div className="text-center py-8 text-outline">Chargement...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-outline">Aucune transaction</div>
            ) : (
              transactions.map((tx, i) => (
                <ProviderTransactionCard key={i} {...tx} />
              ))
            )}
          </div>
          <div className="mt-6 text-center">
            <button className="text-secondary font-button text-button border border-secondary px-6 py-2 rounded-lg hover:bg-secondary/5 transition-colors" onClick={() => setLimit(limit === 10 ? 50 : 10)}>
              {limit === 10 ? "Voir tout l'historique" : "Réduire"}
            </button>
          </div>
        </div>
      </main>
    </ProviderLayout>
  );
}
