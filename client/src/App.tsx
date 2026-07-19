import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "@/store";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RequireAuth } from "@/components/guards/RequireAuth";
import { HomePage } from "@/pages/Home";
import { LoginPage } from "@/pages/Login";
import { RegisterPage } from "@/pages/Register";
import { DashboardPage } from "@/pages/Dashboard";
import { PrestataireDashboard } from "@/pages/PrestataireDashboard";
import { ProviderPlanning } from "@/pages/ProviderPlanning";
import { ProviderRevenus } from "@/pages/ProviderRevenus";
import { ProviderServices } from "@/pages/ProviderServices";
import { ProviderServiceCreate } from "@/pages/ProviderServiceCreate";
import { ProviderParametres } from "@/pages/ProviderParametres";
import { NotFoundPage } from "@/pages/NotFound";
import { ServicesListPage } from "@/pages/ServicesList";
import { ServiceDetailPage } from "@/pages/ServiceDetail";
import { BookingPage } from "@/pages/BookingPage";
import { NotificationsPage } from "@/pages/Notifications";
import { SettingsPage } from "@/pages/Settings";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
}

const DASHBOARD_ROUTES = ["/dashboard", "/my-bookings", "/provider", "/admin"];

function isDashboardPath(path: string): boolean {
  return DASHBOARD_ROUTES.some((route) => path === route || path.startsWith(route + "/"));
}

function AppContent() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isDashboardPage = isDashboardPath(pathname);

  if (isDashboardPage) {
    return (
      <Routes>
        <Route
          path="/dashboard"
          element={
            <RequireAuth allowedRoles={["CLIENT"]}>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <RequireAuth allowedRoles={["CLIENT"]}>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/provider"
          element={
            <RequireAuth allowedRoles={["PROVIDER"]}>
              <PrestataireDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/provider/planning"
          element={
            <RequireAuth allowedRoles={["PROVIDER"]}>
              <ProviderPlanning />
            </RequireAuth>
          }
        />
        <Route
          path="/provider/revenus"
          element={
            <RequireAuth allowedRoles={["PROVIDER"]}>
              <ProviderRevenus />
            </RequireAuth>
          }
        />
        <Route
          path="/provider/services"
          element={
            <RequireAuth allowedRoles={["PROVIDER"]}>
              <ProviderServices />
            </RequireAuth>
          }
        />
        <Route
          path="/provider/services/create"
          element={
            <RequireAuth allowedRoles={["PROVIDER"]}>
              <ProviderServiceCreate />
            </RequireAuth>
          }
        />
        <Route
          path="/provider/parametres"
          element={
            <RequireAuth allowedRoles={["PROVIDER"]}>
              <ProviderParametres />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/*"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
                Admin Dashboard (à implémenter)
              </div>
            </RequireAuth>
          }
        />
      </Routes>
    );
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <ScrollToTop />
      <div className="scroll-progress" id="scroll-progress" />
      {!isAuthPage && <Header />}
      <main className={`flex flex-col ${isAuthPage ? "flex-1" : "flex-grow pt-20"}`}>
        <Routes>
          <Route
            path="/"
            element={
              <PageTransition>
                <HomePage />
              </PageTransition>
            }
          />
          <Route
            path="/services"
            element={
              <PageTransition>
                <ServicesListPage />
              </PageTransition>
            }
          />
          <Route
            path="/services/:id"
            element={
              <PageTransition>
                <ServiceDetailPage />
              </PageTransition>
            }
          />
          <Route
            path="/services/:id/book"
            element={
              <RequireAuth allowedRoles={["CLIENT"]}>
                <PageTransition>
                  <BookingPage />
                </PageTransition>
              </RequireAuth>
            }
          />
          <Route
            path="/notifications"
            element={
              <RequireAuth allowedRoles={["CLIENT", "PROVIDER"]}>
                <PageTransition>
                  <NotificationsPage />
                </PageTransition>
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth allowedRoles={["CLIENT", "PROVIDER"]}>
                <PageTransition>
                  <SettingsPage />
                </PageTransition>
              </RequireAuth>
            }
          />
          <Route
            path="/login"
            element={
              <PageTransition>
                <LoginPage />
              </PageTransition>
            }
          />
          <Route
            path="/register"
            element={
              <PageTransition>
                <RegisterPage />
              </PageTransition>
            }
          />
          <Route
            path="*"
            element={
              <PageTransition>
                <NotFoundPage />
              </PageTransition>
            }
          />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!GOOGLE_CLIENT_ID) {
    return <>{children}</>;
  }
  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <Router>
              <AppContent />
            </Router>
          </QueryClientProvider>
        </Provider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
