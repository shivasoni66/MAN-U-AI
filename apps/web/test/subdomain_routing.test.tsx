import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";
import {
  setTestHostname,
  setExternalRedirectFn,
  getHostnameType,
  buildSubdomainUrl,
  getSubdomainLink,
} from "../src/lib/hostname";

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
    equipmentApi: {
      ...actual.equipmentApi,
      list: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    },
    summariesApi: {
      ...actual.summariesApi,
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
    auditApi: {
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

function renderAppWithRouter(initialPath: string, role?: "admin" | "manager" | "viewer") {
  if (role) {
    localStorage.setItem("manuai_token", "test-token");
    localStorage.setItem(
      "manuai_user",
      JSON.stringify({
        id: "test-user-id",
        name: `${role} test user`,
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

describe("Subdomain-Aware Routing & Cross-Panel Navigation", () => {
  let redirectedUrl: string | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    redirectedUrl = null;
    setExternalRedirectFn((url: string) => {
      redirectedUrl = url;
    });
  });

  afterEach(() => {
    cleanup();
    setTestHostname(null);
  });

  describe("Hostname detection & URL builder unit helpers", () => {
    it("correctly identifies admin, manager, and root hostnames", () => {
      expect(getHostnameType("admin.sharprad-x.tech")).toBe("admin");
      expect(getHostnameType("admin.localhost")).toBe("admin");
      expect(getHostnameType("manager.sharprad-x.tech")).toBe("manager");
      expect(getHostnameType("manager.localhost")).toBe("manager");
      expect(getHostnameType("sharprad-x.tech")).toBe("root");
      expect(getHostnameType("localhost")).toBe("root");
      expect(getHostnameType("man-u-ai-1.onrender.com")).toBe("root");
    });

    it("builds correct target subdomain URLs with path, search params, and hash", () => {
      const url = buildSubdomainUrl(
        "manager",
        "/manager/maintenance",
        "?unit=pump-102",
        "#telemetry",
        "admin.sharprad-x.tech"
      );
      expect(url).toBe("https://manager.sharprad-x.tech/manager/maintenance?unit=pump-102#telemetry");

      const adminUrl = buildSubdomainUrl(
        "admin",
        "/admin/users",
        "?filter=active",
        "#list",
        "manager.sharprad-x.tech"
      );
      expect(adminUrl).toBe("https://admin.sharprad-x.tech/admin/users?filter=active#list");
    });

    it("generates correct cross-subdomain links", () => {
      // On admin subdomain, links to manager should be absolute, links to admin should be relative
      expect(getSubdomainLink("admin", "/admin/login", "admin.sharprad-x.tech")).toBe("/admin/login");
      expect(getSubdomainLink("manager", "/manager/login", "admin.sharprad-x.tech")).toBe(
        "https://manager.sharprad-x.tech/manager/login"
      );

      // On manager subdomain, links to admin should be absolute, links to manager should be relative
      expect(getSubdomainLink("manager", "/manager/login", "manager.sharprad-x.tech")).toBe("/manager/login");
      expect(getSubdomainLink("admin", "/admin/login", "manager.sharprad-x.tech")).toBe(
        "https://admin.sharprad-x.tech/admin/login"
      );

      // On root domain (sharprad-x.tech), links point directly to production subdomains
      expect(getSubdomainLink("admin", "/admin/login", "sharprad-x.tech")).toBe(
        "https://admin.sharprad-x.tech/admin/login"
      );
      expect(getSubdomainLink("manager", "/manager/login", "sharprad-x.tech")).toBe(
        "https://manager.sharprad-x.tech/manager/login"
      );
    });
  });

  describe("Admin Subdomain (admin.sharprad-x.tech)", () => {
    beforeEach(() => {
      setTestHostname("admin.sharprad-x.tech");
    });

    it("redirects unauthenticated domain root (/) to /admin/login", async () => {
      renderAppWithRouter("/");
      expect(await screen.findByText(/Plant Administration Console/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /Sign In to Admin Console/i })).toBeDefined();
    });

    it("redirects authenticated Admin from domain root (/) to /admin dashboard", async () => {
      renderAppWithRouter("/", "admin");
      expect(await screen.findByRole("heading", { name: "Admin Dashboard" })).toBeDefined();
      expect(screen.getAllByText(/System Administration/i).length).toBeGreaterThan(0);
    });

    it("redirects authenticated non-Admin (viewer) from root (/) to access-denied page (/unsupported-access)", async () => {
      renderAppWithRouter("/", "viewer");
      expect(await screen.findByRole("heading", { name: /Workspace access unavailable/i })).toBeDefined();
      expect(screen.getByText(/This account does not have a supported web-panel role/i)).toBeDefined();
    });

    it("redirects authenticated Manager from admin domain root (/) to manager subdomain workspace", () => {
      renderAppWithRouter("/", "manager");
      expect(redirectedUrl).toBe("https://manager.sharprad-x.tech/manager");
    });

    it("allows direct access to /admin/login", async () => {
      renderAppWithRouter("/admin/login");
      expect(await screen.findByText(/Plant Administration Console/i)).toBeDefined();
    });

    it("allows direct access to /admin/register (provisioning guide)", async () => {
      renderAppWithRouter("/admin/register");
      expect(await screen.findByText(/Administrator Provisioning/i)).toBeDefined();
    });

    it("allows direct authenticated access to /admin/users", async () => {
      renderAppWithRouter("/admin/users", "admin");
      expect(await screen.findByRole("heading", { name: /Personnel & Role Management/i })).toBeDefined();
    });

    it("allows direct authenticated access to /admin/insights", async () => {
      renderAppWithRouter("/admin/insights", "admin");
      expect(await screen.findByRole("heading", { name: /System Insights & Reliability Metrics/i })).toBeDefined();
    });

    it("allows direct authenticated access to /admin/activity", async () => {
      renderAppWithRouter("/admin/activity", "admin");
      expect(await screen.findByRole("heading", { name: /System Activity & Audit Log/i })).toBeDefined();
    });

    it("allows direct authenticated access to /admin/settings", async () => {
      renderAppWithRouter("/admin/settings", "admin");
      expect(await screen.findByRole("heading", { name: /System Settings & Configuration/i })).toBeDefined();
    });

    it("redirects generic /login to /admin/login when on admin subdomain", async () => {
      renderAppWithRouter("/login");
      expect(await screen.findByText(/Plant Administration Console/i)).toBeDefined();
    });

    it("intercepts cross-panel navigation to /manager/* and redirects to manager subdomain preserving query and hash", () => {
      renderAppWithRouter("/manager/maintenance?unit=pump-102#logs");
      expect(redirectedUrl).toBe("https://manager.sharprad-x.tech/manager/maintenance?unit=pump-102#logs");
    });
  });

  describe("Manager Subdomain (manager.sharprad-x.tech)", () => {
    beforeEach(() => {
      setTestHostname("manager.sharprad-x.tech");
    });

    it("redirects unauthenticated domain root (/) to /manager/login", async () => {
      renderAppWithRouter("/");
      expect(await screen.findByText(/Plant Operations Workspace/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /Sign In to Operations Workspace/i })).toBeDefined();
    });

    it("redirects authenticated Manager from domain root (/) to /manager dashboard", async () => {
      renderAppWithRouter("/", "manager");
      expect(await screen.findByRole("heading", { name: "Manager Dashboard" })).toBeDefined();
      expect(screen.getAllByText(/Operations Workspace/i).length).toBeGreaterThan(0);
    });

    it("redirects authenticated non-Manager (viewer) from root (/) to access-denied page (/unsupported-access)", async () => {
      renderAppWithRouter("/", "viewer");
      expect(await screen.findByRole("heading", { name: /Workspace access unavailable/i })).toBeDefined();
      expect(screen.getByText(/This account does not have a supported web-panel role/i)).toBeDefined();
    });

    it("redirects authenticated Admin from manager domain root (/) to admin subdomain console", () => {
      renderAppWithRouter("/", "admin");
      expect(redirectedUrl).toBe("https://admin.sharprad-x.tech/admin");
    });

    it("allows direct access to /manager/login", async () => {
      renderAppWithRouter("/manager/login");
      expect(await screen.findByText(/Plant Operations Workspace/i)).toBeDefined();
    });

    it("allows direct access to /manager/register (onboarding guide)", async () => {
      renderAppWithRouter("/manager/register");
      expect((await screen.findAllByText(/Plant Operations Enrollment/i)).length).toBeGreaterThan(0);
    });

    it("allows direct authenticated access to /manager/operations", async () => {
      renderAppWithRouter("/manager/operations", "manager");
      expect(await screen.findByRole("heading", { name: /Operational Work Management/i })).toBeDefined();
    });

    it("allows direct authenticated access to /manager/maintenance", async () => {
      renderAppWithRouter("/manager/maintenance", "manager");
      expect(await screen.findByRole("heading", { name: /Maintenance Coordination & Shift Handover/i })).toBeDefined();
    });

    it("allows direct authenticated access to /manager/knowledge", async () => {
      renderAppWithRouter("/manager/knowledge", "manager");
      expect(await screen.findByRole("heading", { name: /Knowledge Library/i })).toBeDefined();
    });

    it("redirects generic /login to /manager/login when on manager subdomain", async () => {
      renderAppWithRouter("/login");
      expect(await screen.findByText(/Plant Operations Workspace/i)).toBeDefined();
    });

    it("intercepts cross-panel navigation to /admin/* and redirects to admin subdomain preserving query and hash", () => {
      renderAppWithRouter("/admin/users?role=all#top");
      expect(redirectedUrl).toBe("https://admin.sharprad-x.tech/admin/users?role=all#top");
    });
  });

  describe("Root Domain (sharprad-x.tech / localhost)", () => {
    beforeEach(() => {
      setTestHostname("sharprad-x.tech");
    });

    it("renders PortalSelectionPage on root (/) when unauthenticated", async () => {
      renderAppWithRouter("/");
      expect(await screen.findByRole("heading", { name: /Select Workspace Portal/i })).toBeDefined();
      expect(screen.getByText(/Choose your designated facility workspace to sign in/i)).toBeDefined();
      expect(screen.getByRole("link", { name: /Admin Login/i })).toBeDefined();
      expect(screen.getByRole("link", { name: /Manager \/ Operator Login/i })).toBeDefined();
    });

    it("renders PortalSelectionPage on /portal when unauthenticated", async () => {
      renderAppWithRouter("/portal");
      expect(await screen.findByRole("heading", { name: /Select Workspace Portal/i })).toBeDefined();
    });

    it("redirects authenticated Admin on root (/) to /admin", async () => {
      renderAppWithRouter("/", "admin");
      expect(await screen.findByRole("heading", { name: "Admin Dashboard" })).toBeDefined();
    });

    it("redirects authenticated Manager on root (/) to /manager", async () => {
      renderAppWithRouter("/", "manager");
      expect(await screen.findByRole("heading", { name: "Manager Dashboard" })).toBeDefined();
    });

    it("does not redirect root domain to Admin or Manager when unauthenticated", async () => {
      renderAppWithRouter("/");
      expect(redirectedUrl).toBeNull();
      expect(await screen.findByRole("heading", { name: /Select Workspace Portal/i })).toBeDefined();
    });

    it("does not trigger cross-panel external redirects when browsing on the root domain", async () => {
      renderAppWithRouter("/admin/login");
      expect(redirectedUrl).toBeNull();
      expect(await screen.findByText(/Plant Administration Console/i)).toBeDefined();

      cleanup();
      redirectedUrl = null;
      renderAppWithRouter("/manager/login");
      expect(redirectedUrl).toBeNull();
      expect(await screen.findByText(/Plant Operations Workspace/i)).toBeDefined();
    });
  });

  describe("Local Development Subdomain Emulation (*.localhost:5173)", () => {
    it("http://admin.localhost:5173/ opens existing AdminLoginPage when unauthenticated", async () => {
      setTestHostname("admin.localhost");
      renderAppWithRouter("/");
      expect(await screen.findByText(/Plant Administration Console/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /Sign In to Admin Console/i })).toBeDefined();
    });

    it("http://admin.localhost:5173/ opens existing AdminDashboardPage when authenticated Admin", async () => {
      setTestHostname("admin.localhost");
      renderAppWithRouter("/", "admin");
      expect(await screen.findByRole("heading", { name: "Admin Dashboard" })).toBeDefined();
    });

    it("http://manager.localhost:5173/ opens existing ManagerLoginPage when unauthenticated", async () => {
      setTestHostname("manager.localhost");
      renderAppWithRouter("/");
      expect(await screen.findByText(/Plant Operations Workspace/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /Sign In to Operations Workspace/i })).toBeDefined();
    });

    it("http://manager.localhost:5173/ opens existing ManagerDashboardPage when authenticated Manager", async () => {
      setTestHostname("manager.localhost");
      renderAppWithRouter("/", "manager");
      expect(await screen.findByRole("heading", { name: "Manager Dashboard" })).toBeDefined();
    });

    it("http://localhost:5173/ opens existing PortalSelectionPage when unauthenticated", async () => {
      setTestHostname("localhost");
      renderAppWithRouter("/");
      expect(await screen.findByRole("heading", { name: /Select Workspace Portal/i })).toBeDefined();
    });

    it("cross-subdomain redirect from admin.localhost to manager.localhost preserves local port and path", () => {
      setTestHostname("admin.localhost");
      renderAppWithRouter("/manager/operations?line=A#status");
      expect(redirectedUrl).toMatch(/^http:\/\/manager\.localhost(:\d+)?\/manager\/operations\?line=A#status$/);
    });
  });
});
