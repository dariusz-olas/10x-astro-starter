// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    sitemap()
  ],
  adapter: cloudflare({
    mode: "advanced",
    functionPerRoute: false,
  }),
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
