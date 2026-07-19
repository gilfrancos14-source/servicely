import { useLocation } from "react-router-dom";
import { ProviderSidebar } from "./ProviderSidebar";
import { ProviderTopBar } from "./ProviderTopBar";

const mobileNavItems = [
  { icon: "dashboard", label: "Aperçu", path: "/provider", iconFilled: true },
  { icon: "calendar_month", label: "Planning", path: "/provider/planning" },
  { icon: "payments", label: "Revenus", path: "/provider/revenus" },
  { icon: "settings", label: "Profil", path: "/provider/parametres" },
];

export function ProviderLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col md:flex-row antialiased">
      <ProviderSidebar />

      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest shadow-[0px_-4px_20px_rgba(15,23,42,0.05)] z-50 flex justify-around items-center py-3 px-stack-sm">
        {mobileNavItems.map((item) => {
          const active = item.path === "/provider"
            ? location.pathname === "/provider"
            : location.pathname.startsWith(item.path);
          return (
            <a
              key={item.label}
              className={`flex flex-col items-center gap-1 ${active ? "text-secondary font-bold" : "text-outline hover:text-secondary transition-colors"}`}
              href={item.path}
            >
              <span className="material-symbols-outlined" style={active || item.iconFilled ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
              <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <ProviderTopBar />
        {children}
      </div>
    </div>
  );
}
