import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: "dashboard", label: "Tableau de Bord", path: "/dashboard" },
  { icon: "calendar_month", label: "Réservations", path: "/my-bookings" },
  { icon: "search", label: "Explorer les services", path: "/services" },
  { icon: "query_stats", label: "Analyses", path: "#" },
  { icon: "settings", label: "Paramètres", path: "/settings" },
];

export function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="hidden md:flex flex-col h-full py-stack-lg bg-surface-container-lowest h-screen w-64 fixed left-0 top-0 shadow-md z-50">
      <div className="px-gutter mb-stack-lg flex items-center gap-stack-sm">
        <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>construction</span>
        <div>
          <h1 className="font-headline-md text-headline-md text-primary">Servicely</h1>
          <p className="font-label-md text-label-md text-on-surface-variant">Expert Facilitateur</p>
        </div>
      </div>
      <ul className="flex-1 flex flex-col gap-2 px-margin-mobile">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <li
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`group flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-premium active:scale-95 ${
                isActive
                  ? "bg-surface-container-high text-secondary font-bold border-r-4 border-secondary"
                  : "text-on-surface-variant hover:bg-secondary/10 hover:text-secondary"
              }`}
            >
              <span className={`material-symbols-outlined transition-premium ${isActive ? "" : "group-hover:scale-110"}`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </li>
          );
        })}
      </ul>
      <div className="px-margin-mobile mt-auto pt-stack-md border-t border-surface-variant">
        <button
          onClick={() => navigate("/services")}
          className="pulse-effect w-full flex justify-center items-center gap-2 py-3 bg-secondary text-on-secondary rounded-lg font-button text-button hover:bg-on-secondary-container hover:-translate-y-0.5 transition-premium shadow-md active:scale-95 mb-4"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Réserver un service
        </button>
        <ul className="flex flex-col gap-2">
          <li className="flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer text-on-surface-variant hover:bg-surface-container-high transition-premium active:scale-95">
            <span className="material-symbols-outlined">contact_support</span>
            <span className="font-label-md text-label-md">Support</span>
          </li>
          <li
            className="flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer text-error hover:bg-error-container transition-premium active:scale-95"
            onClick={logout}
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Déconnexion</span>
          </li>
        </ul>
      </div>
    </nav>
  );
}
