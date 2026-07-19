import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: "dashboard", label: "Aperçu", path: "/provider" },
  { icon: "calendar_month", label: "Planning", path: "/provider/planning" },
  { icon: "handyman", label: "Mes Services", path: "/provider/services" },
  { icon: "payments", label: "Revenus", path: "/provider/revenus" },
  { icon: "settings", label: "Paramètres", path: "/provider/parametres" },
];

export function ProviderSidebar() {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/provider") return location.pathname === "/provider";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="hidden md:flex bg-surface-container-low h-screen w-64 fixed left-0 top-0 flex-col py-gutter px-stack-md z-40 border-r border-outline-variant/30">
      <div className="mb-section-gap px-stack-sm flex items-center gap-stack-md">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-on-secondary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>handyman</span>
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Servicely</h1>
          <p className="font-label-md text-label-md text-outline">Expert Portal</p>
        </div>
      </div>
      <ul className="flex flex-col gap-stack-sm flex-grow">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <li key={item.label}>
              <a
                className={`flex items-center gap-stack-md px-stack-md py-stack-sm rounded-lg transition-colors duration-200 ${
                  active
                    ? "text-secondary font-bold border-r-4 border-secondary bg-surface-container-high"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
                href={item.path}
              >
                <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto pt-gutter border-t border-outline-variant">
        <button
          className="w-full bg-secondary text-on-secondary font-button text-button py-stack-sm rounded-lg hover:bg-on-secondary-fixed-variant transition-colors flex items-center justify-center gap-stack-sm"
          onClick={() => {}}
        >
          <span className="material-symbols-outlined">add</span>
          Nouvelle Mission
        </button>
        <button
          className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-error hover:bg-error-container transition-colors rounded-lg font-label-md text-label-md"
          onClick={logout}
        >
          <span className="material-symbols-outlined">logout</span>
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
