import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { app, isAllowedOrigin, DEFAULT_PRODUCTION_ORIGINS } from "../src/app";
import { env } from "../src/config/env";

describe("Subdomain CORS Security & Integration", () => {
  const originalNodeEnv = env.NODE_ENV;
  const originalCorsOrigin = env.CORS_ORIGIN;

  afterEach(() => {
    (env as any).NODE_ENV = originalNodeEnv;
    (env as any).CORS_ORIGIN = originalCorsOrigin;
  });

  describe("DEFAULT_PRODUCTION_ORIGINS constant", () => {
    it("contains exact origins for both admin and manager subdomains", () => {
      expect(DEFAULT_PRODUCTION_ORIGINS).toContain("https://admin.sharprad-x.tech");
      expect(DEFAULT_PRODUCTION_ORIGINS).toContain("https://manager.sharprad-x.tech");
      expect(DEFAULT_PRODUCTION_ORIGINS.length).toBe(2);
    });
  });

  describe("isAllowedOrigin in production mode", () => {
    beforeEach(() => {
      (env as any).NODE_ENV = "production";
      (env as any).CORS_ORIGIN = "https://sharprad-x.tech,https://api.sharprad-x.tech";
    });

    it("allows requests with no origin (e.g. mobile app, curl, server-to-server)", () => {
      expect(isAllowedOrigin(undefined)).toBe(true);
    });

    it("allows admin subdomain in production", () => {
      expect(isAllowedOrigin("https://admin.sharprad-x.tech")).toBe(true);
    });

    it("allows manager subdomain in production", () => {
      expect(isAllowedOrigin("https://manager.sharprad-x.tech")).toBe(true);
    });

    it("allows explicitly configured origins from CORS_ORIGIN", () => {
      expect(isAllowedOrigin("https://sharprad-x.tech")).toBe(true);
      expect(isAllowedOrigin("https://api.sharprad-x.tech")).toBe(true);
    });

    it("rejects unauthorized third-party origins in production", () => {
      expect(isAllowedOrigin("https://malicious-site.com")).toBe(false);
      expect(isAllowedOrigin("https://phishing-admin.sharprad-x.tech.evil.com")).toBe(false);
      expect(isAllowedOrigin("http://admin.sharprad-x.tech")).toBe(false); // Insecure HTTP
      expect(isAllowedOrigin("http://localhost:5173")).toBe(false); // Localhost disallowed in prod unless configured
    });

    it("enforces no wildcard in production even if CORS_ORIGIN specifies '*'", () => {
      (env as any).CORS_ORIGIN = "*";
      expect(isAllowedOrigin("https://malicious-site.com")).toBe(false);
      // But valid subdomains still allowed
      expect(isAllowedOrigin("https://admin.sharprad-x.tech")).toBe(true);
      expect(isAllowedOrigin("https://manager.sharprad-x.tech")).toBe(true);
    });
  });

  describe("isAllowedOrigin in development mode", () => {
    beforeEach(() => {
      (env as any).NODE_ENV = "development";
      (env as any).CORS_ORIGIN = "http://localhost:5173";
    });

    it("allows localhost origins on any port for local development", () => {
      expect(isAllowedOrigin("http://localhost:5173")).toBe(true);
      expect(isAllowedOrigin("http://localhost:3000")).toBe(true);
      expect(isAllowedOrigin("http://127.0.0.1:4000")).toBe(true);
    });

    it("still allows production subdomains during development testing", () => {
      expect(isAllowedOrigin("https://admin.sharprad-x.tech")).toBe(true);
      expect(isAllowedOrigin("https://manager.sharprad-x.tech")).toBe(true);
    });
  });

  describe("Express CORS Preflight and Headers HTTP Integration", () => {
    it("handles CORS preflight OPTIONS request for admin subdomain", async () => {
      const res = await request(app)
        .options("/health")
        .set("Origin", "https://admin.sharprad-x.tech")
        .set("Access-Control-Request-Method", "GET");

      expect(res.headers["access-control-allow-origin"]).toBe("https://admin.sharprad-x.tech");
      expect(res.headers["access-control-allow-credentials"]).toBe("true");
    });

    it("handles CORS preflight OPTIONS request for manager subdomain", async () => {
      const res = await request(app)
        .options("/health")
        .set("Origin", "https://manager.sharprad-x.tech")
        .set("Access-Control-Request-Method", "GET");

      expect(res.headers["access-control-allow-origin"]).toBe("https://manager.sharprad-x.tech");
      expect(res.headers["access-control-allow-credentials"]).toBe("true");
    });

    it("attaches Access-Control-Allow-Origin header on GET /health for admin subdomain", async () => {
      const res = await request(app)
        .get("/health")
        .set("Origin", "https://admin.sharprad-x.tech");

      expect(res.status).toBe(200);
      expect(res.headers["access-control-allow-origin"]).toBe("https://admin.sharprad-x.tech");
    });

    it("attaches Access-Control-Allow-Origin header on GET /health for manager subdomain", async () => {
      const res = await request(app)
        .get("/health")
        .set("Origin", "https://manager.sharprad-x.tech");

      expect(res.status).toBe(200);
      expect(res.headers["access-control-allow-origin"]).toBe("https://manager.sharprad-x.tech");
    });
  });
});

