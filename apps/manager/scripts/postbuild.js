import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, "../dist");
const indexHtmlPath = path.join(distDir, "index.html");

if (!fs.existsSync(indexHtmlPath)) {
  console.error("[postbuild:manager] Error: dist/index.html does not exist!");
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexHtmlPath, "utf-8");

// Fallback for hosts that don't auto-apply SPA rewrites
const notFoundPath = path.join(distDir, "404.html");
fs.writeFileSync(notFoundPath, indexHtml);
console.log("[postbuild:manager] Created dist/404.html");

// Ensure Cloudflare Pages _redirects file exists for 200 rewrite
const redirectsPath = path.join(distDir, "_redirects");
fs.writeFileSync(redirectsPath, "# Cloudflare Pages SPA Catch-all Rewrite\n/* /index.html 200\n");
console.log("[postbuild:manager] Created dist/_redirects for Cloudflare Pages SPA support");

// Pre-generate routes for direct refresh support
const routes = [
  "login",
  "register",
  "dashboard",
  "operations",
  "maintenance",
  "knowledge",
  "equipment",
  "summaries",
  "assistant",
  "engineer-mobile-required",
  "unsupported-access",
  "manager",
  "manager/login",
  "manager/register",
  "manager/dashboard",
  "manager/operations",
  "manager/maintenance",
  "manager/knowledge",
  "manager/equipment",
  "manager/summaries",
  "manager/assistant",
];

for (const route of routes) {
  const routeDir = path.join(distDir, route);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  fs.writeFileSync(path.join(routeDir, "index.html"), indexHtml);
  if (!route.includes("/")) {
    fs.writeFileSync(path.join(distDir, `${route}.html`), indexHtml);
  }
}
console.log(`[postbuild:manager] Generated static fallbacks for ${routes.length} client routes.`);
