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
  EngineerMobileRequiredPage,
} from "@man-u-ai/web-core";
import { ManagerShell } from "./layout/ManagerShell";
import { ManagerDashboardPage } from "./pages/ManagerDashboardPage";
import { ManagerLoginPage } from "./pages/ManagerLoginPage";
import { ManagerRegisterPage } from "./pages/ManagerRegisterPage";
import { ManagerOperationsPage } from "./pages/ManagerOperationsPage";
import { ManagerMaintenancePage } from "./pages/ManagerMaintenancePage";

export function ProtectedManagerRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "manager") {
    if (user.role === "admin") return <Navigate to="/unsupported-access" replace />;
    if (user.role === "engineer") return <Navigate to="/engineer-mobile-required" replace />;
    return <Navigate to="/unsupported-access" replace />;
  }

  return <>{children}</>;
}

export function PublicManagerRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated && user?.role === "manager") {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function ManagerRoot() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated || !user) {
    return <ManagerLoginPage />;
  }
  if (user.role === "manager") {
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
          Your account ({user?.email}) has role <strong className="text-emerald-400 uppercase">{user?.role}</strong>.
          The Operations Workspace is designated for Plant Operations Managers.
        </p>
        <div className="pt-4 flex flex-col gap-2">
          {user?.role === "admin" && (
            <a
              href="https://admin.sharprad-x.tech"
              className="btn-primary py-2.5 text-xs font-semibold"
            >
              Go to Plant Administration Console →
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
        {/* Root Route: Shows login unauthenticated, redirects to dashboard if manager */}
        <Route path="/" element={<ManagerRoot />} />

        {/* Public Authentication Routes */}
        <Route
          path="login"
          element={
            <PublicManagerRoute>
              <ManagerLoginPage />
            </PublicManagerRoute>
          }
        />
        <Route
          path="register"
          element={
            <PublicManagerRoute>
              <ManagerRegisterPage />
            </PublicManagerRoute>
          }
        />

        {/* Authenticated Manager Workspace */}
        <Route
          element={
            <ProtectedManagerRoute>
              <ManagerShell />
            </ProtectedManagerRoute>
          }
        >
          <Route path="dashboard" element={<ManagerDashboardPage />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="chat/:conversationId" element={<AssistantPage />} />
          <Route path="knowledge" element={<KnowledgeLibraryPage />} />
          <Route path="knowledge/manuals/:documentId" element={<ManualViewerPage />} />
          <Route path="equipment" element={<EquipmentPage />} />
          <Route path="summaries" element={<SummariesPage />} />
          <Route path="operations" element={<ManagerOperationsPage />} />
          <Route path="maintenance" element={<ManagerMaintenancePage />} />
        </Route>

        {/* Backward Compatibility Redirects for /manager/* */}
        <Route path="manager" element={<Navigate to="/dashboard" replace />} />
        <Route path="manager/login" element={<Navigate to="/login" replace />} />
        <Route path="manager/register" element={<Navigate to="/register" replace />} />
        <Route path="manager/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="manager/assistant" element={<Navigate to="/assistant" replace />} />
        <Route path="manager/chat/:conversationId" element={<LegacyChatRedirect />} />
        <Route path="manager/knowledge" element={<Navigate to="/knowledge" replace />} />
        <Route path="manager/knowledge/manuals/:documentId" element={<LegacyManualRedirect />} />
        <Route path="manager/equipment" element={<Navigate to="/equipment" replace />} />
        <Route path="manager/summaries" element={<Navigate to="/summaries" replace />} />
        <Route path="manager/operations" element={<Navigate to="/operations" replace />} />
        <Route path="manager/maintenance" element={<Navigate to="/maintenance" replace />} />

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
