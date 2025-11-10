// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Na Windows ARM64, workerd (Cloudflare adapter) nie działa w dev mode
// Adapter jest używany tylko w production build (na Cloudflare Pages działa poprawnie)
// W dev mode Astro działa bez adaptera - SSR działa lokalnie przez Node.js
// W WSL/Linux adapter powinien działać normalnie
import cloudflare from "@astrojs/cloudflare";

let adapter = undefined;
const isProduction = process.env.NODE_ENV === "production";
const isWindowsARM64 = process.platform === "win32" && process.arch === "arm64";
const isBuild = process.argv.includes("build") || isProduction;

// Ładuj adapter w build mode (production) lub jeśli nie jesteśmy na Windows ARM64
if (isBuild && !isWindowsARM64) {
  // Użyj adaptera tylko w build/production i tylko jeśli nie jesteśmy na Windows ARM64
  adapter = cloudflare();
}

// https://astro.build/config
export default defineConfig({
  integrations: [react(), sitemap()],
  adapter: adapter,
  output: "server", // SSR dla endpointów API
  vite: {
    envPrefix: "PUBLIC_",
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          // Cache-busting dla JS
          entryFileNames: "assets/[name].[hash].js",
          chunkFileNames: "assets/[name].[hash].js",
          // CSS jest obsługiwany przez Astro/Tailwind automatycznie
        },
      },
    },
  },
});
