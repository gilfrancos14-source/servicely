interface ProviderRequestCardProps {
  id: string;
  name: string;
  avatar?: string;
  service: string;
  duration: string;
  location?: string;
  date?: string;
  urgent?: boolean;
  statusLabel?: string;
  category?: string;
  showActions?: boolean;
  icon?: string;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  acceptPending?: boolean;
  rejectPending?: boolean;
}

export function ProviderRequestCard({ id, name, avatar, service, duration, location, date, urgent, statusLabel = "En attente", category, showActions = true, icon, onAccept, onReject, acceptPending, rejectPending }: ProviderRequestCardProps) {
  const iconMap: Record<string, string> = {
    "Nettoyage complet": "cleaning_services",
    "Réparation fuite": "plumbing",
    "Taille de haie": "garden",
  };
  const serviceIcon = icon || iconMap[service] || "handyman";

  const isAccepted = statusLabel === "Acceptée";
  const isRejected = statusLabel === "Refusée";
  const avatarBg = isAccepted ? "bg-secondary/20" : isRejected ? "bg-error/10" : "";
  const avatarColor = isAccepted ? "text-secondary" : isRejected ? "text-error" : "";

  return (
    <div
      className="bg-surface-container-lowest/80 backdrop-blur-sm rounded-xl p-stack-md border border-outline-variant ambient-shadow-base hover:ambient-shadow-hover transition-ambient flex flex-col sm:flex-row sm:items-center justify-between gap-stack-md"
      data-category={category}
    >
      <div className="flex gap-4 items-start sm:items-center w-full sm:w-auto">
        {avatar ? (
          <img alt={name} className="w-14 h-14 rounded-full object-cover shrink-0" src={avatar} />
        ) : (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${avatarBg} ${avatarColor}`}>
            <span className="material-symbols-outlined">person</span>
          </div>
        )}
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-label-md font-bold text-primary client-name">{name}</h4>
            {urgent && (
              <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold uppercase tracking-wider">Urgent</span>
            )}
            <span className={`status-label px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isAccepted ? "bg-secondary text-on-secondary" : isRejected ? "bg-error text-on-error" : "bg-secondary/10 text-secondary"
            }`}>{statusLabel}</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-outline">{serviceIcon}</span>
            {service}{duration ? ` - ${duration}` : ""}
          </p>
          {location && date && (
            <p className="font-label-md text-label-md text-outline mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {location} • {date}
            </p>
          )}
        </div>
      </div>
      {showActions && (
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start border-t sm:border-t-0 border-outline-variant/30 pt-4 sm:pt-0 mt-2 sm:mt-0">
          <button
            className="px-4 py-2 bg-transparent text-outline font-button text-button rounded-lg border border-transparent hover:bg-surface-container-high transition-colors disabled:opacity-50"
            onClick={() => onReject?.(id)}
            disabled={rejectPending}
          >
            {rejectPending ? "..." : "Refuser"}
          </button>
          <button
            className="px-6 py-2 bg-secondary text-on-secondary font-button text-button rounded-lg hover:bg-on-secondary-fixed-variant transition-colors shadow-sm disabled:opacity-50"
            onClick={() => onAccept?.(id)}
            disabled={acceptPending}
          >
            {acceptPending ? "..." : "Accepter"}
          </button>
        </div>
      )}
    </div>
  );
}

