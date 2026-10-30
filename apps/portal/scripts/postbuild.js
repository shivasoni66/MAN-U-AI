import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, "../dist");
const indexHtmlPath = path.join(distDir, "index.html");

if (!fs.existsSync(indexHtmlPath)) {
  console.error("[postbuild:portal] Error: dist/index.html does not exist!");
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexHtmlPath, "utf-8");

// Fallback for hosts that don't auto-apply SPA rewrites
const notFoundPath = path.join(distDir, "404.html");
fs.writeFileSync(notFoundPath, indexHtml);

// Cloudflare Pages _redirects file
const redirectsPath = path.join(distDir, "_redirects");
fs.writeFileSync(redirectsPath, "# Cloudflare Pages SPA Catch-all Rewrite\n/* /index.html 200\n");

// Portal route fallback
const portalDir = path.join(distDir, "portal");
if (!fs.existsSync(portalDir)) {
  fs.mkdirSync(portalDir, { recursive: true });
}
fs.writeFileSync(path.join(portalDir, "index.html"), indexHtml);
fs.writeFileSync(path.join(distDir, "portal.html"), indexHtml);

console.log("[postbuild:portal] Completed portal build fallbacks.");
