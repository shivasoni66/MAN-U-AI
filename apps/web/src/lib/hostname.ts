/**
 * Subdomain and hostname-aware routing utilities for MAN-U-AI.
 * Supports:
 * - https://admin.sharprad-x.tech (Plant Administration Console)
 * - https://manager.sharprad-x.tech (Plant Operations Workspace)
 * - https://sharprad-x.tech (Root Portal & Unified Entry)
 * Also gracefully supports *.localhost and localhost for local development and testing.
 */

export type HostnameType = "admin" | "manager" | "root";

export const PRODUCTION_DOMAINS = {
  admin: "admin.sharprad-x.tech",
  manager: "manager.sharprad-x.tech",
  root: "sharprad-x.tech",
} as const;

let overrideHostname: string | null = null;

/**
 * Allows unit and integration tests to deterministically simulate visiting
 * different hostnames (e.g., admin.sharprad-x.tech, manager.sharprad-x.tech, sharprad-x.tech).
 */
export function setTestHostname(hostname: string | null): void {
  overrideHostname = hostname;
}

/**
 * Returns the currently active hostname, checking the test override first
 * before reading from window.location.hostname.
 */
export function getCurrentHostname(): string {
  if (overrideHostname !== null) return overrideHostname;
  if (typeof window !== "undefined" && window.location?.hostname) {
    return window.location.hostname;
  }
  return "";
}

/**
 * Determines whether the given hostname belongs to the Admin console,
 * Manager workspace, or the main/root portal.
 */
export function getHostnameType(hostname?: string): HostnameType {
  const raw = (hostname !== undefined ? hostname : getCurrentHostname()).toLowerCase().trim();
  const host = raw.split(":")[0];
  if (host === PRODUCTION_DOMAINS.admin || host.startsWith("admin.")) {
    return "admin";
  }
  if (host === PRODUCTION_DOMAINS.manager || host.startsWith("manager.")) {
    return "manager";
  }
  return "root";
}

/**
 * Builds the canonical full URL for a target subdomain while preserving
 * pathname, query parameters, and hash fragment.
 */
export function buildSubdomainUrl(
  target: "admin" | "manager",
  pathname: string,
  search: string = "",
  hash: string = "",
  currentHostname?: string
): string {
  const host = (currentHostname !== undefined ? currentHostname : getCurrentHostname()).toLowerCase().trim();
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  // If local development environment (e.g. admin.localhost:5173 or localhost:5173)
  if (host.endsWith(".localhost") || host === "localhost" || host === "127.0.0.1") {
    const protocol = typeof window !== "undefined" && window.location?.protocol ? window.location.protocol : "http:";
    const port = typeof window !== "undefined" && window.location?.port ? `:${window.location.port}` : "";
    return `${protocol}//${target}.localhost${port}${cleanPath}${search}${hash}`;
  }

  // Production canonical subdomains for sharprad-x.tech
  return `https://${target}.sharprad-x.tech${cleanPath}${search}${hash}`;
}

/**
 * Returns the appropriate hyperlink target for UI navigation links.
 * When on the same subdomain, returns a relative path for seamless client-side SPA navigation.
 * When linking to the other subdomain (or from the root domain in production), returns an absolute URL.
 */
export function getSubdomainLink(
  target: "admin" | "manager",
  path: string,
  currentHostname?: string
): string {
  const hostType = getHostnameType(currentHostname);
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // If already on the target subdomain, keep link local (relative SPA navigation)
  if (hostType === target) {
    return cleanPath;
  }

  const host = (currentHostname !== undefined ? currentHostname : getCurrentHostname()).toLowerCase().trim();

  // If on production root or production subdomain, return absolute URL to target subdomain
  if (host === PRODUCTION_DOMAINS.root || host.endsWith(".sharprad-x.tech")) {
    return `https://${target}.sharprad-x.tech${cleanPath}`;
  }

  // If on local development (plain localhost / 127.0.0.1), keep relative so dev works without local DNS
  if (host === "localhost" || host === "127.0.0.1" || !host) {
    return cleanPath;
  }

  // If on *.localhost
  if (host.endsWith(".localhost")) {
    const protocol = typeof window !== "undefined" && window.location?.protocol ? window.location.protocol : "http:";
    const port = typeof window !== "undefined" && window.location?.port ? `:${window.location.port}` : "";
    return `${protocol}//${target}.localhost${port}${cleanPath}`;
  }

  return `https://${target}.sharprad-x.tech${cleanPath}`;
}

/**
 * Pluggable redirect executor that can be intercepted in unit tests.
 */
export let externalRedirectFn: (url: string) => void = (url: string) => {
  if (typeof window !== "undefined") {
    if (window.location.replace) {
      window.location.replace(url);
    } else {
      window.location.href = url;
    }
  }
};

export function setExternalRedirectFn(fn: (url: string) => void): void {
  externalRedirectFn = fn;
}

export function performExternalRedirect(url: string): void {
  externalRedirectFn(url);
}

