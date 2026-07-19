interface ActionButton {
  label: string;
  icon: string;
  variant: "primary" | "outline" | "ghost";
}

interface ProviderPlanningCardProps {
  startTime: string;
  endTime: string;
  status: "en_cours" | "a_venir" | "termine";
  title: string;
  icon: string;
  clientName: string;
  address?: string;
  actions: ActionButton[];
}

const statusConfig = {
  en_cours: {
    label: "En cours",
    className: "status-badge-progress",
    borderColor: "bg-primary",
  },
  a_venir: {
    label: "À venir",
    className: "status-badge-upcoming",
    borderColor: "bg-secondary",
  },
  termine: {
    label: "Terminé",
    className: "status-badge-done",
    borderColor: "bg-outline-variant",
  },
};

export function ProviderPlanningCard({
  startTime, endTime, status, title, icon, clientName, address, actions,
}: ProviderPlanningCardProps) {
  const cfg = statusConfig[status];
  const isDone = status === "termine";

  return (
    <div className={`glass-card rounded-xl p-stack-md md:p-gutter flex flex-col md:flex-row gap-stack-md md:gap-gutter items-start relative overflow-hidden transition-all hover:shadow-[0px_10px_30px_rgba(15,23,42,0.08)] hover:-translate-y-1 ${isDone ? "opacity-75" : ""}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${cfg.borderColor}`} />
      <div className={`flex flex-col items-center justify-center min-w-[80px] p-stack-sm rounded-lg ${isDone ? "bg-surface-container-lowest border border-outline-variant" : "bg-surface-container-low"}`}>
        <span className={`font-headline-md text-headline-md ${isDone ? "text-outline" : "text-primary"}`}>{startTime}</span>
        <span className={`font-label-md text-label-md ${isDone ? "text-outline" : "text-on-surface-variant"}`}>{endTime}</span>
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-stack-sm">
          <div>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${cfg.className}`}>{cfg.label}</span>
            <h3 className={`font-headline-md text-headline-md ${isDone ? "text-outline" : "text-primary"}`}>{title}</h3>
          </div>
          <span className={`p-2 rounded-full ${isDone ? "bg-surface-container-low text-outline" : "bg-surface-container-highest text-secondary"}`}>
            <span className="material-symbols-outlined">{icon}</span>
          </span>
        </div>
        <div className="flex flex-col gap-2 mb-stack-md">
          <div className="flex items-center gap-2 text-on-surface-variant font-body-md text-body-md">
            <span className="material-symbols-outlined text-outline">person</span>
            <span>{clientName}</span>
          </div>
          {address && (
            <div className="flex items-center gap-2 text-on-surface-variant font-body-md text-body-md">
              <span className="material-symbols-outlined text-outline">location_on</span>
              <span>{address}</span>
            </div>
          )}
        </div>
        <div className="flex gap-stack-sm mt-auto">
          {actions.map((action) => {
            const base = "flex-1 font-button text-button py-2 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors";
            const styles = {
              primary: "bg-secondary text-on-secondary hover:bg-on-secondary-fixed-variant",
              outline: "border border-secondary text-secondary hover:bg-secondary hover:text-on-secondary",
              ghost: isDone
                ? "bg-surface-container-low text-outline"
                : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
            };
            return (
              <button key={action.label} className={`${base} ${styles[action.variant]}`}>
                <span className="material-symbols-outlined">{action.icon}</span>
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
