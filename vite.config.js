import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        id: "./",
        name: "Munchkin Zombie — licznik walki",
        short_name: "Munchkin Zombie",
        description: "Zombie’owy licznik siły gracza i potwora do Munchkina. Działa także offline.",
        lang: "pl",
        start_url: "./",
        scope: "./",
        display: "standalone",
        background_color: "#afa995",
        theme_color: "#afa995",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
    }),
  ],
});
