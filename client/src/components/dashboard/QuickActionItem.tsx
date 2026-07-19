import { useNavigate } from "react-router-dom";

interface QuickActionItemProps {
  icon: string;
  label: string;
  variant?: "default" | "explore";
  to?: string;
}

export function QuickActionItem({ icon, label, variant = "default", to }: QuickActionItemProps) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (to) navigate(to);
  };

  const classes = "bg-surface-container-lowest p-4 rounded-xl border transition-premium card-hover flex flex-col items-center justify-center gap-3 text-center aspect-square w-full";

  if (variant === "explore") {
    return (
      <button onClick={handleClick} className={`${classes} border-secondary border-dashed hover:bg-secondary/5`}>
        <div className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-sm transition-premium hover:rotate-12">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className="font-label-md text-label-md text-secondary">{label}</span>
      </button>
    );
  }

  return (
    <button onClick={handleClick} className={`${classes} border-surface-variant shadow-[0px_4px_20px_rgba(15,23,42,0.05)] group`}>
      <div className="w-12 h-12 rounded-full bg-surface-container-high group-hover:bg-secondary group-hover:text-on-secondary transition-premium flex items-center justify-center text-on-surface-variant">
        <span className="material-symbols-outlined group-hover:scale-110 transition-premium">{icon}</span>
      </div>
      <span className="font-label-md text-label-md text-primary group-hover:text-secondary transition-premium">{label}</span>
    </button>
  );
}
