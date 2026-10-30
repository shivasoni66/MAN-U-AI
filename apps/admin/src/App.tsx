import React from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import {
  AuthProvider,
  useAuth,
  AssistantPage,
  KnowledgeLibraryPage,
  ManualViewerPage,
  EquipmentPage,
  SummariesPage,
  ActivityPage,
  IntegrationsPage,
  SettingsPage,
  EngineerMobileRequiredPage,
} from "@man-u-ai/web-core";
import { AdminShell } from "./layout/AdminShell";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminRegisterPage } from "./pages/AdminRegisterPage";
import { AdminAnalyticsPage } from "./pages/AdminAnalyticsPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";

export function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    if (user.role === "manager") return <Navigate to="/unsupported-access" replace />;
    if (user.role === "engineer") return <Navigate to="/engineer-mobile-required" replace />;
    return <Navigate to="/unsupported-access" replace />;
  }

  return <>{children}</>;
}

export function PublicAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated && user?.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function AdminRoot() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated || !user) {
    return <AdminLoginPage />;
  }
  if (user.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  if (user.role === "engineer") {
    return <Navigate to="/engineer-mobile-required" replace />;
  }
  return <Navigate to="/unsupported-access" replace />;
}

function LegacyManualRedirect() {
  const { documentId } = useParams<{ documentId: string }>();
  return <Navigate to={`/knowledge/manuals/${documentId}`} replace />;
}

function LegacyChatRedirect() {
  const { conversationId } = useParams<{ conversationId: string }>();
  return <Navigate to={`/chat/${conversationId}`} replace />;
}

function UnsupportedAccessPage() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-surface-1 border border-hairline rounded-2xl p-8 space-y-4 shadow-xl">
        <h1 className="text-xl font-bold text-ink">Access Restricted</h1>
        <p className="text-sm text-ink-subtle">
          Your account ({user?.email}) has role <strong className="text-warning uppercase">{user?.role}</strong>.
          The Administration Console is restricted exclusively to authorized System Administrators.
        </p>
        <div className="pt-4 flex flex-col gap-2">
          {user?.role === "manager" && (
            <a
              href="https://manager.sharprad-x.tech"
              className="btn-primary py-2.5 text-xs font-semibold"
            >
              Go to Plant Operations Workspace →
            </a>
          )}
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="btn-secondary py-2 text-xs"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Root Route: Shows login unauthenticated, redirects to dashboard if admin */}
        <Route path="/" element={<AdminRoot />} />

        {/* Public Authentication Routes */}
        <Route
          path="login"
          element={
            <PublicAdminRoute>
              <AdminLoginPage />
            </PublicAdminRoute>
          }
        />
        <Route
          path="register"
          element={
            <PublicAdminRoute>
              <AdminRegisterPage />
            </PublicAdminRoute>
          }
        />

        {/* Authenticated Admin Workspace */}
        <Route
          element={
            <ProtectedAdminRoute>
              <AdminShell />
            </ProtectedAdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="chat/:conversationId" element={<AssistantPage />} />
          <Route path="knowledge" element={<KnowledgeLibraryPage />} />
          <Route path="knowledge/manuals/:documentId" element={<ManualViewerPage />} />
          <Route path="equipment" element={<EquipmentPage />} />
          <Route path="summaries" element={<SummariesPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="insights" element={<AdminAnalyticsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Backward Compatibility Redirects for /admin/* */}
        <Route path="admin" element={<Navigate to="/dashboard" replace />} />
        <Route path="admin/login" element={<Navigate to="/login" replace />} />
        <Route path="admin/register" element={<Navigate to="/register" replace />} />
        <Route path="admin/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="admin/assistant" element={<Navigate to="/assistant" replace />} />
        <Route path="admin/chat/:conversationId" element={<LegacyChatRedirect />} />
        <Route path="admin/knowledge" element={<Navigate to="/knowledge" replace />} />
        <Route path="admin/knowledge/manuals/:documentId" element={<LegacyManualRedirect />} />
        <Route path="admin/equipment" element={<Navigate to="/equipment" replace />} />
        <Route path="admin/summaries" element={<Navigate to="/summaries" replace />} />
        <Route path="admin/insights" element={<Navigate to="/insights" replace />} />
        <Route path="admin/analytics" element={<Navigate to="/analytics" replace />} />
        <Route path="admin/users" element={<Navigate to="/users" replace />} />
        <Route path="admin/activity" element={<Navigate to="/activity" replace />} />
        <Route path="admin/integrations" element={<Navigate to="/integrations" replace />} />
        <Route path="admin/settings" element={<Navigate to="/settings" replace />} />

        {/* Shared Policy Routes */}
        <Route path="engineer-mobile-required" element={<EngineerMobileRequiredPage />} />
        <Route path="unsupported-access" element={<UnsupportedAccessPage />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
