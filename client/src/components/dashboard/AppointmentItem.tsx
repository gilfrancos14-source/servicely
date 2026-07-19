interface AppointmentItemProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  provider: string;
  date: string;
  status: string;
  statusBg: string;
  statusText: string;
}

export function AppointmentItem({ icon, iconBg, iconColor, title, provider, date, status, statusBg, statusText }: AppointmentItemProps) {
  return (
    <div className="group flex items-center justify-between p-4 rounded-lg bg-surface-bright border border-surface-variant hover:border-secondary/30 transition-premium card-hover cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0 transition-premium group-hover:rotate-6`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <h4 className="font-label-md text-label-md font-bold text-primary">{title}</h4>
          <p className="font-body-md text-body-md text-on-surface-variant">avec {provider}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-label-md text-label-md text-primary font-semibold">{date}</p>
        <span className={`inline-block mt-1 px-2 py-1 ${statusBg} ${statusText} rounded text-xs font-medium transition-premium group-hover:bg-secondary group-hover:text-on-secondary`}>
          {status}
        </span>
      </div>
    </div>
  );
}
