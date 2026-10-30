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

export function setTestHostname(hostname: string | null): void {
  overrideHostname = hostname;
}

export function getCurrentHostname(): string {
  if (overrideHostname !== null) return overrideHostname;
  if (typeof window !== "undefined" && window.location?.hostname) {
    return window.location.hostname;
  }
  return "";
}

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

export function buildSubdomainUrl(
  target: "admin" | "manager",
  currentHostname?: string,
  pathname?: string,
  search?: string,
  hash?: string
): string {
  const host = (currentHostname !== undefined ? currentHostname : getCurrentHostname()).toLowerCase().trim();
  const cleanPath = pathname ? (pathname.startsWith("/") ? pathname : `/${pathname}`) : "/";
  const searchPart = search ? (search.startsWith("?") ? search : `?${search}`) : "";
  const hashPart = hash ? (hash.startsWith("#") ? hash : `#${hash}`) : "";
  const queryAndHash = `${searchPart}${hashPart}`;

  if (host.endsWith(".localhost") || host === "localhost" || host === "127.0.0.1") {
    const protocol = typeof window !== "undefined" && window.location?.protocol ? window.location.protocol : "http:";
    const port = typeof window !== "undefined" && window.location?.port ? `:${window.location.port}` : "";
    return `${protocol}//${target}.localhost${port}${cleanPath}${queryAndHash}`;
  }

  return `https://${target}.sharprad-x.tech${cleanPath}${queryAndHash}`;
}

export function getSubdomainLink(
  target: "admin" | "manager",
  path: string,
  currentHostname?: string
): string {
  const hostType = getHostnameType(currentHostname);
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (hostType === target) {
    return cleanPath;
  }

  const host = (currentHostname !== undefined ? currentHostname : getCurrentHostname()).toLowerCase().trim();

  if (host === PRODUCTION_DOMAINS.root || host.endsWith(".sharprad-x.tech")) {
    return `https://${target}.sharprad-x.tech${cleanPath}`;
  }

  if (host === "localhost" || host === "127.0.0.1" || !host) {
    return cleanPath;
  }

  if (host.endsWith(".localhost")) {
    const protocol = typeof window !== "undefined" && window.location?.protocol ? window.location.protocol : "http:";
    const port = typeof window !== "undefined" && window.location?.port ? `:${window.location.port}` : "";
    return `${protocol}//${target}.localhost${port}${cleanPath}`;
  }

  return `https://${target}.sharprad-x.tech${cleanPath}`;
}

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
