import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";
import type { UserRole } from "@man-u-ai/shared";

vi.mock("@man-u-ai/web-core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@man-u-ai/web-core")>();
  const socket = { on: vi.fn(), off: vi.fn() };

  return {
    ...actual,
    disconnectSocket: vi.fn(),
    getSocket: vi.fn(() => socket),
    apiClient: {
      get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
      post: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
      patch: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
      delete: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    },
    conversationsApi: {
      ...actual.conversationsApi,
      list: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    },
    documentsApi: {
      ...actual.documentsApi,
      list: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    },
    equipmentApi: {
      ...actual.equipmentApi,
      list: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    },
    usersApi: {
      ...actual.usersApi,
      list: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
      create: vi.fn().mockResolvedValue({ data: { success: true } }),
      updateRole: vi.fn().mockResolvedValue({ data: { success: true } }),
      delete: vi.fn().mockResolvedValue({ data: { success: true } }),
    },
    settingsApi: {
      get: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
      update: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    },
    analyticsApi: {
      ...actual.analyticsApi,
      insights: vi.fn().mockResolvedValue({
        data: {
          success: true,
          data: {
            range: "all",
            totalIndexedDocuments: 0,
            activeSafetyIncidents: 0,
            avgResponseLatencyMs: 0,
            citationAccuracyRate: 100,
            queryVolumeTrend: [],
            safetyCategoryDistribution: [],
          },
        },
      }),
      activity: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
      summaries: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    },
  };
});

function renderAdminApp(initialPath = "/", role?: UserRole) {
  if (role) {
    localStorage.setItem("manuai_token", "test-admin-token");
    localStorage.setItem(
      "manuai_user",
      JSON.stringify({
        id: "admin-user-id",
        name: `${role} Test User`,
        email: `${role}@plant.io`,
        role,
        createdAt: new Date().toISOString(),
      })
    );
  } else {
    localStorage.clear();
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Independent Admin Application Routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders AdminLoginPage at unauthenticated root /", () => {
    renderAdminApp("/");
    expect(screen.getAllByText(/Plant Administration Console/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Admin Email Address/i)).toBeDefined();
    expect(screen.getByText(/Sign In to Admin Console/i)).toBeDefined();
  });

  it("renders AdminLoginPage at /login", () => {
    renderAdminApp("/login");
    expect(screen.getAllByText(/Plant Administration Console/i).length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText("admin@plant.io")).toBeDefined();
  });

  it("renders AdminRegisterPage at /register with zero-trust policy", () => {
    renderAdminApp("/register");
    expect(screen.getByText(/Administrator Provisioning & Enrollment/i)).toBeDefined();
    expect(screen.getByText(/Administrative Zero-Trust Policy/i)).toBeDefined();
  });

  it("redirects unauthenticated visitor from /dashboard to /login", () => {
    renderAdminApp("/dashboard");
    expect(screen.getAllByText(/Plant Administration Console/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Sign In to Admin Console/i)).toBeDefined();
  });

  it("renders AdminDashboardPage for authenticated admin at root /", async () => {
    renderAdminApp("/", "admin");
    expect(screen.getAllByText(/Admin Dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Facility-wide system overview/i)).toBeDefined();
    expect(screen.getAllByText(/Personnel & Roles/i).length).toBeGreaterThan(0);
  });

  it("renders AdminUsersPage for authenticated admin at /users", async () => {
    renderAdminApp("/users", "admin");
    expect(screen.getByText(/Personnel & Role Management/i)).toBeDefined();
    expect(screen.getByText(/Enrolled Personnel/i)).toBeDefined();
  });

  it("handles legacy /admin/users path via redirect", async () => {
    renderAdminApp("/admin/users", "admin");
    expect(screen.getByText(/Personnel & Role Management/i)).toBeDefined();
  });

  it("rejects non-admin role (manager) from accessing admin console", () => {
    renderAdminApp("/dashboard", "manager");
    expect(screen.getByText(/Access Restricted/i)).toBeDefined();
    expect(screen.getByText(/Go to Plant Operations Workspace/i)).toBeDefined();
  });

  it("redirects engineer to /engineer-mobile-required", () => {
    renderAdminApp("/dashboard", "engineer");
    expect(screen.getByText(/Continue in the MAN-U-AI Flutter app/i)).toBeDefined();
  });
});
