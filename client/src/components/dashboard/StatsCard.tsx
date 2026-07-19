interface StatsCardProps {
  title: string;
  value: React.ReactNode;
  subtitle: string;
  icon: string;
  delay: number;
  trending?: boolean;
}

export function StatsCard({ title, value, subtitle, icon, delay, trending }: StatsCardProps) {
  return (
    <div
      className="card-hover shimmer-bg bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-surface-variant transition-premium relative overflow-hidden"
      style={{ animationDelay: `${delay}s` }}
    >
      {trending && (
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-secondary opacity-5 rounded-full blur-2xl" />
      )}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">{title}</h3>
        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary overflow-hidden">
          <span
            className="material-symbols-outlined icon-animate"
            style={{ fontVariationSettings: "'FILL' 1", animationDelay: `${delay + 0.2}s` }}
          >{icon}</span>
        </div>
      </div>
      <p className="font-headline-xl text-headline-xl text-primary relative z-10">{value}</p>
      <p className={`font-body-md text-body-md ${trending ? "text-secondary" : "text-on-surface-variant"} mt-2 flex items-center gap-1 relative z-10`}>
        {trending && <span className="material-symbols-outlined text-sm">trending_up</span>}
        {subtitle}
      </p>
    </div>
  );
}
