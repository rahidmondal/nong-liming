import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8')) as { version: string };

// https://vite.dev/config/
export default defineConfig({
  base: '/nong-liming/',
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['pwa-icon.svg', 'maskable-icon.svg'],
      manifest: false,
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' || request.destination === 'style' || request.destination === 'font',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'static-cache',
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'image-cache',
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },
    }),
  ],
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
  },
});
