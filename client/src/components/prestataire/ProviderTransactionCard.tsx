interface ProviderTransactionCardProps {
  icon: string;
  title: string;
  subtitle: string;
  amount: string;
  amountColor: string;
  date: string;
}

export function ProviderTransactionCard({ icon, title, subtitle, amount, amountColor, date }: ProviderTransactionCardProps) {
  return (
    <div className="bg-surface rounded-lg p-4 border border-outline-variant/20 flex items-center justify-between hover:ambient-shadow-base transition-shadow group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-secondary-container transition-colors">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <h4 className="font-button text-button text-primary">{title}</h4>
          <p className="font-body-md text-body-md text-sm text-on-surface-variant">{subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <div className={`font-button text-button font-bold ${amountColor}`}>{amount}</div>
        <div className="font-label-md text-label-md text-outline text-xs mt-1">{date}</div>
      </div>
    </div>
  );
}
