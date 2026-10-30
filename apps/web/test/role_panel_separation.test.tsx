import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";

vi.mock("../src/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/lib/api")>();
  const socket = { on: vi.fn(), off: vi.fn() };

  return {
    ...actual,
    disconnectSocket: vi.fn(),
    getSocket: vi.fn(() => socket),
    conversationsApi: {
      ...actual.conversationsApi,
      list: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    },
    documentsApi: {
      ...actual.documentsApi,
      list: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    },
    analyticsApi: {
      ...actual.analyticsApi,
      insights: vi.fn().mockResolvedValue({
        data: {
          success: true,
          data: {
            range: "all",
            totalIndexedDocuments: 0,
            totalMonitoredEquipment: 0,
            totalRAGInquiries: 0,
            activeOpenIssues: 0,
            metrics: {
              groundingPolicy: "Strict (Zero-Tolerance)",
              unverifiedCitationsAllowed: 0,
            },
          },
        },
      }),
    },
  };
});

function renderAppAs(role: "admin" | "manager" | "viewer" | "engineer", initialPath: string) {
  localStorage.setItem("manuai_token", "test-token");
  localStorage.setItem(
    "manuai_user",
    JSON.stringify({
      id: "test-user",
      name: "Panel Test User",
      email: "panel-test@plant.io",
      role,
      createdAt: new Date(0).toISOString(),
    })
  );

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

describe("Role-specific web panel separation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the Manager / Operator workspace and excludes admin navigation for manager role", async () => {
    renderAppAs("manager", "/manager");

    expect(await screen.findByRole("heading", { name: "Manager Dashboard" })).toBeDefined();
    expect(screen.getByText("Manager / Operator Access")).toBeDefined();
    expect(screen.getAllByText("Knowledge Library").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("System Insights & Analytics")).toBeNull();
    expect(screen.queryByText("Access Control")).toBeNull();
    expect(screen.queryByText("Personnel & Roles")).toBeNull();
  });

  it("redirects manager accounts away from direct admin URLs", async () => {
    renderAppAs("manager", "/admin/settings");

    expect(await screen.findByRole("heading", { name: "Manager Dashboard" })).toBeDefined();
    expect(screen.queryByText("System Insights & Analytics")).toBeNull();
  });

  it("redirects admin accounts to the Admin panel instead of the Manager panel", async () => {
    renderAppAs("admin", "/manager");

    expect(await screen.findByRole("heading", { name: "Admin Dashboard" })).toBeDefined();
    expect(screen.getByText("Insights & Analytics")).toBeDefined();
    expect(screen.getByText("Personnel & Roles")).toBeDefined();
    expect(screen.getAllByText("Ecosystem Integrations").length).toBeGreaterThanOrEqual(1);
  });

  it("routes engineers to the dedicated Flutter-app notice rather than a web panel", async () => {
    renderAppAs("engineer", "/");

    expect(await screen.findByRole("heading", { name: "Continue in the MAN-U-AI Flutter app" })).toBeDefined();
    expect(screen.queryByRole("heading", { name: "Manager Dashboard" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Admin Dashboard" })).toBeNull();
  });

  it("redirects viewer accounts to unsupported-access page and denies manager panel access", async () => {
    renderAppAs("viewer", "/manager");

    expect(await screen.findByRole("heading", { name: "Workspace access unavailable" })).toBeDefined();
    expect(screen.queryByRole("heading", { name: "Manager Dashboard" })).toBeNull();
  });

  it("redirects unauthenticated users to manager login when accessing /manager", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/manager"]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByRole("heading", { name: "Plant Operations Workspace" })).toBeDefined();
    expect(screen.getByRole("button", { name: /Sign In to Operations Workspace/i })).toBeDefined();
  });

  it("redirects unauthenticated users to admin login when accessing /admin", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin"]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByRole("heading", { name: "Plant Administration Console" })).toBeDefined();
    expect(screen.getByRole("button", { name: /Sign In to Admin Console/i })).toBeDefined();
  });

  it("renders dedicated Admin login and register pages independently", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin/register"]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByRole("heading", { name: "Administrator Provisioning & Enrollment" })).toBeDefined();
    expect(screen.getByText(/Public self-registration is restricted in production environments/i)).toBeDefined();
    expect(screen.getByRole("link", { name: /Sign in to Administrator Console/i })).toBeDefined();
  });

  it("renders dedicated Manager login and register pages independently", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/manager/register"]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByRole("heading", { name: "Plant Operations Enrollment Request" })).toBeDefined();
    expect(screen.getByText(/Public self-registration is restricted in production environments/i)).toBeDefined();
    expect(screen.getByRole("link", { name: /Sign in to Operations Workspace/i })).toBeDefined();
  });

  it("renders portal selection page with Admin and Manager links for unauthenticated root visitors", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByRole("heading", { name: "Select Workspace Portal" })).toBeDefined();
    expect(screen.getByRole("link", { name: /Admin Login/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Manager \/ Operator Login/i })).toBeDefined();
  });

  it("renders portal selection page for unauthenticated direct /portal navigation", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/portal"]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByRole("heading", { name: "Select Workspace Portal" })).toBeDefined();
    expect(screen.getByRole("link", { name: /Admin Login/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Manager \/ Operator Login/i })).toBeDefined();
  });

  it("redirects authenticated Admin navigating to /portal to the Admin panel", async () => {
    renderAppAs("admin", "/portal");

    expect(await screen.findByRole("heading", { name: "Admin Dashboard" })).toBeDefined();
    expect(screen.getByText("Insights & Analytics")).toBeDefined();
  });

  it("redirects authenticated Manager navigating to /portal to the Manager panel", async () => {
    renderAppAs("manager", "/portal");

    expect(await screen.findByRole("heading", { name: "Manager Dashboard" })).toBeDefined();
    expect(screen.getByText("Manager / Operator Access")).toBeDefined();
  });

  it("redirects authenticated Engineer navigating to /portal to the mobile app notice", async () => {
    renderAppAs("engineer", "/portal");

    expect(await screen.findByRole("heading", { name: "Continue in the MAN-U-AI Flutter app" })).toBeDefined();
  });

  it("allows managers to access operations and maintenance workflow routes", async () => {
    renderAppAs("manager", "/manager/operations");

    expect(await screen.findByRole("heading", { name: "Operational Work Management" })).toBeDefined();
    expect(screen.getByText("Operations Center")).toBeDefined();
  });

  it("allows admins to access dedicated users and analytics routes", async () => {
    renderAppAs("admin", "/admin/users");

    expect(await screen.findByRole("heading", { name: "Personnel & Role Management" })).toBeDefined();
    expect(screen.getByText("Provision New Plant Account")).toBeDefined();
  });
});
