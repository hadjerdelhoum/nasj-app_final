import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev the API runs on :4000; the proxy keeps the browser same-origin (no CORS needed).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: { "/api": { target: process.env.VITE_PROXY_TARGET ?? "http://localhost:4000", changeOrigin: true } },
  },
  build: { sourcemap: false, chunkSizeWarningLimit: 700 },
  test: { environment: "node" },
});
