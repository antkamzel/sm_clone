import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Demo SM",
        short_name: "DemoSM",
        description: "This is a demo app",
        background_color: "#4a2545",
        theme_color: "#4a2545",
        start_url: "/",
        display: "standalone",
        lang: "en",
        icons: [
          {
            src: "icons/pwa-48x48.png",
            sizes: "48x48",
            type: "image/png",
          },
          {
            src: "icons/pwa-72x72.png",
            sizes: "72x72",
            type: "image/png",
          },
          {
            src: "icons/pwa-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "icons/pwa-144x144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^\/.*\.(png|jpg|jpeg|svg)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
            },
          },
        ],
      },
    }),
  ],
});
