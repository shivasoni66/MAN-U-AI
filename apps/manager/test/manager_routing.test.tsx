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
      list: vi.fn().mockResolvedValue({
        data: {
          success: true,
          data: [
            {
              id: "eq-1",
              name: "Hydraulic Press HP-200",
              model: "HP-200-X",
              location: "Bay 3",
              status: "active",
              serialNumber: "SN-98214",
            },
          ],
        },
      }),
    },
    analyticsApi: {
      ...actual.analyticsApi,
      summaries: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    },
  };
});

function renderManagerApp(initialPath = "/", role?: UserRole) {
  if (role) {
    localStorage.setItem("manuai_token", "test-manager-token");
    localStorage.setItem(
      "manuai_user",
      JSON.stringify({
        id: "manager-user-id",
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

describe("Independent Manager Application Routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders ManagerLoginPage at unauthenticated root /", () => {
    renderManagerApp("/");
    expect(screen.getAllByText(/Plant Operations & Maintenance Workspace/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Work Email Address/i)).toBeDefined();
    expect(screen.getByText(/Sign In to Operations Workspace/i)).toBeDefined();
  });

  it("renders ManagerLoginPage at /login", () => {
    renderManagerApp("/login");
    expect(screen.getAllByText(/Plant Operations & Maintenance Workspace/i).length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText("manager@plant.io")).toBeDefined();
  });

  it("renders ManagerRegisterPage at /register with enrollment policy", () => {
    renderManagerApp("/register");
    expect(screen.getByText(/Plant Operations Enrollment Request/i)).toBeDefined();
    expect(screen.getByText(/Plant Operations Enrollment Policy/i)).toBeDefined();
  });

  it("redirects unauthenticated visitor from /dashboard to /login", () => {
    renderManagerApp("/dashboard");
    expect(screen.getAllByText(/Plant Operations & Maintenance Workspace/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Sign In to Operations Workspace/i)).toBeDefined();
  });

  it("renders ManagerDashboardPage for authenticated manager at root /", async () => {
    renderManagerApp("/", "manager");
    expect(screen.getAllByText(/Manager Dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Operational center for shopfloor machines/i)).toBeDefined();
    expect(screen.getAllByText(/Operations Management/i).length).toBeGreaterThan(0);
  });

  it("renders ManagerOperationsPage for authenticated manager at /operations", async () => {
    renderManagerApp("/operations", "manager");
    expect(screen.getByText(/Operational Work Management/i)).toBeDefined();
    expect(screen.getByText(/Real-time status of physical production machinery/i)).toBeDefined();
  });

  it("renders ManagerMaintenancePage for authenticated manager at /maintenance", async () => {
    renderManagerApp("/maintenance", "manager");
    expect(screen.getAllByText(/Maintenance Coordination/i).length).toBeGreaterThan(0);
  });

  it("handles legacy /manager/operations path via redirect", async () => {
    renderManagerApp("/manager/operations", "manager");
    expect(screen.getAllByText(/Operations Management/i).length).toBeGreaterThan(0);
  });

  it("rejects non-manager role (admin) from accessing manager console", () => {
    renderManagerApp("/dashboard", "admin");
    expect(screen.getByText(/Access Restricted/i)).toBeDefined();
    expect(screen.getByText(/Go to Plant Administration Console/i)).toBeDefined();
  });

  it("redirects engineer to /engineer-mobile-required", () => {
    renderManagerApp("/dashboard", "engineer");
    expect(screen.getByText(/Continue in the MAN-U-AI Flutter app/i)).toBeDefined();
  });
});
