import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@man-u-ai/shared": path.resolve(__dirname, "../../packages/shared/src/index.ts"),
      "@man-u-ai/ui": path.resolve(__dirname, "../../packages/ui/src/index.ts"),
      "@man-u-ai/web-core": path.resolve(__dirname, "../../packages/web-core/src/index.ts"),
    },
  },
  server: {
    port: 5175,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:4000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  // @ts-expect-error vitest config field
  test: {
    environment: "happy-dom",
  },
});
