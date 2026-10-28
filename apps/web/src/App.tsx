import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AdminRoutes } from "./admin/routes/AdminRoutes";
import { ManagerRoutes } from "./manager/routes/ManagerRoutes";
import { LoginPage } from "./pages/LoginPage";
import { PortalSelectionPage } from "./pages/PortalSelectionPage";
import { EngineerMobileRequiredPage } from "./pages/EngineerMobileRequiredPage";
import type { UserRole } from "@man-u-ai/shared";

export type WebPanel = "admin" | "manager";

export function getWebPanel(role: UserRole | undefined): WebPanel | null {
  if (role === "admin") return "admin";
  if (role === "manager") return "manager";
  return null;
}

export function getRoleLanding(role: UserRole | undefined): string {
  if (role === "admin") return "/admin";
  if (role === "manager") return "/manager";
  if (role === "engineer") return "/engineer-mobile-required";
  return "/unsupported-access";
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to={getRoleLanding(user?.role)} replace />;
  return <>{children}</>;
}

function RoleHomeRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated || !user) {
    return <PortalSelectionPage />;
  }
  return <Navigate to={getRoleLanding(user.role)} replace />;
}

function LegacyRouteRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const panel = getWebPanel(user.role);
  if (!panel) return <Navigate to={getRoleLanding(user.role)} replace />;

  // Preserve older bookmarks such as /knowledge and /equipment by moving them
  // under the authenticated user's panel prefix.
  return (
    <Navigate
      to={`/${panel}${location.pathname === "/" ? "" : location.pathname}${location.search}${location.hash}`}
      replace
    />
  );
}

function UnsupportedAccessPage() {
  const { logout } = useAuth();

  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <section className="max-w-lg rounded-2xl border border-hairline bg-surface-1 p-7">
        <h1 className="text-xl font-bold text-ink">Workspace access unavailable</h1>
        <p className="text-sm text-ink-subtle mt-2">
          This account does not have a supported web-panel role. Contact your administrator if you believe this is incorrect.
        </p>
        <button onClick={logout} className="btn-secondary mt-5">Sign out</button>
      </section>
    </main>
  );
}

function AuthenticatedOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function EngineerOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role !== "engineer") return <Navigate to={getRoleLanding(user.role)} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root Role-Based Home Redirect */}
      <Route path="/" element={<RoleHomeRedirect />} />

      {/* Global / Legacy Login */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Admin Panel Independent Route Tree */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Manager Panel Independent Route Tree */}
      <Route path="/manager/*" element={<ManagerRoutes />} />

      {/* Dedicated Engineer Mobile Application Notice */}
      <Route
        path="/engineer-mobile-required"
        element={
          <EngineerOnlyRoute>
            <EngineerMobileRequiredPage />
          </EngineerOnlyRoute>
        }
      />

      {/* Restricted Sandbox / Viewer Unsupported Access Notice */}
      <Route
        path="/unsupported-access"
        element={
          <AuthenticatedOnlyRoute>
            <UnsupportedAccessPage />
          </AuthenticatedOnlyRoute>
        }
      />

      {/* Legacy Fallback Redirect */}
      <Route path="*" element={<LegacyRouteRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
