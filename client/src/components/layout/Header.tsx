import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
  CalendarCheck,
  Settings,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

const navLinks = [
  { label: "Services", href: "/services", isRoute: true as const },
  { label: "About", href: "/#about" },
  { label: "FAQ", href: "/#faq" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Contact", href: "/#contact" },
];

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-surface/80 backdrop-blur-md fixed top-0 w-full z-50 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-20">
        <div className="flex items-center">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
            Servicely
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-gutter">
          {navLinks.map((item) => {
            if ("isRoute" in item) {
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`font-body-md text-body-md ${
                    item.label === "Services"
                      ? "text-secondary font-bold border-b-2 border-secondary hover:opacity-80"
                      : "text-on-surface-variant hover:text-primary hover:opacity-80"
                  } transition-opacity duration-200`}
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <a
                key={item.label}
                href={item.href}
                className={`font-body-md text-body-md ${
                  item.label === "Services"
                    ? "text-secondary font-bold border-b-2 border-secondary hover:opacity-80"
                    : "text-on-surface-variant hover:text-primary hover:opacity-80"
                } transition-opacity duration-200`}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        <div className="flex items-center space-x-stack-sm md:space-x-stack-md">
          {isAuthenticated ? (
            <>
              <div className="hidden md:block">
                <NotificationDropdown />
              </div>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="hidden md:flex items-center gap-2 outline-none px-2 py-1 rounded-xl hover:bg-surface-container-low transition-colors">
                    <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center border border-outline-variant/30 overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-on-surface-variant" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-on-surface-variant">{user?.firstName}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-outline" />
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[220px] rounded-2xl border border-outline-variant/30 p-2 shadow-xl bg-surface"
                    sideOffset={8}
                    align="end"
                  >
                    <div className="px-3 py-2 mb-1">
                      <p className="text-sm font-semibold text-on-surface">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-on-surface-variant">{user?.email}</p>
                    </div>
                    <div className="h-px bg-outline-variant/50 mx-2" />
                    <DropdownMenu.Item asChild>
                      <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl cursor-pointer outline-none text-on-surface-variant hover:bg-surface-container-low transition-colors">
                        <LayoutDashboard className="h-4 w-4" />
                        Tableau de bord
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link to="/my-bookings" className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl cursor-pointer outline-none text-on-surface-variant hover:bg-surface-container-low transition-colors">
                        <CalendarCheck className="h-4 w-4" />
                        Mes réservations
                      </Link>
                    </DropdownMenu.Item>
                    <div className="h-px bg-outline-variant/50 mx-2" />
                    <DropdownMenu.Item asChild>
                      <Link to="/settings" className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl cursor-pointer outline-none text-on-surface-variant hover:bg-surface-container-low transition-colors">
                        <Settings className="h-4 w-4" />
                        Paramètres
                      </Link>
                    </DropdownMenu.Item>
                    {user?.role === "ADMIN" && (
                      <DropdownMenu.Item asChild>
                        <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl cursor-pointer outline-none text-on-surface-variant hover:bg-surface-container-low transition-colors">
                          <ShieldCheck className="h-4 w-4" />
                          Administration
                        </Link>
                      </DropdownMenu.Item>
                    )}
                    <div className="h-px bg-outline-variant/50 mx-2" />
                    <DropdownMenu.Item asChild>
                      <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm rounded-xl cursor-pointer outline-none text-error hover:bg-error-container/20 transition-colors">
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </button>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </>
          ) : (
            <>
              <button className="hidden md:block font-button text-button text-secondary border-[1.5px] border-secondary rounded hover:bg-secondary/10 px-4 py-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Link to="/login">Log In</Link>
              </button>
              <button className="font-button text-button bg-secondary text-on-secondary rounded px-4 py-2 hover:bg-secondary/90 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Link to="/register">Sign Up</Link>
              </button>
            </>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 rounded-xl border border-outline-variant/50 flex items-center justify-center text-on-surface-variant"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-outline-variant/30 bg-surface animate-fade-in">
          <div className="px-margin-mobile py-4 space-y-1">
            {navLinks.map((item) => {
              const props = { onClick: () => setMobileOpen(false), className: "block px-3 py-2.5 text-body-md text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container-low transition-colors" };
              if ("isRoute" in item) {
                return <Link key={item.label} to={item.href} {...props}>{item.label}</Link>;
              }
              return <a key={item.label} href={item.href} {...props}>{item.label}</a>;
            })}
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-body-md text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  Tableau de bord
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="block w-full text-left px-3 py-2.5 text-body-md text-error rounded-lg hover:bg-error-container/20 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="pt-3 space-y-2 border-t border-outline-variant/30">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <button className="w-full font-button text-button text-secondary border-[1.5px] border-secondary rounded hover:bg-secondary/10 px-4 py-2 transition-all">
                    Log In
                  </button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <button className="w-full font-button text-button bg-secondary text-on-secondary rounded px-4 py-2 hover:bg-secondary/90 shadow-sm transition-all">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
