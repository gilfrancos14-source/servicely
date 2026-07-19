import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

function getDashboardPath(role?: string): string {
  switch (role) {
    case "PROVIDER": return "/provider";
    case "ADMIN": return "/admin";
    default: return "/dashboard";
  }
}

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
}