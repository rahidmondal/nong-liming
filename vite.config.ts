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
      includeAssets: [
        'favicon.svg',
        'pwa-icon.svg',
        'maskable-icon.svg',
        'screenshot-vertical.svg',
        'screenshot-horizontal.svg',
        'sql-wasm.wasm',
      ],
      manifest: {
        name: 'NongLiMing',
        short_name: 'nong-liming',
        description: 'Learn Thai using Indic phonetics with English SVO grammar in focused, mobile-first sessions.',
        id: '/nong-liming/?source=pwa',
        start_url: '/nong-liming/?source=pwa',
        scope: '/nong-liming/',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait-primary',
        background_color: '#0b0f1a',
        theme_color: '#0b0f1a',
        lang: 'en',
        dir: 'ltr',
        categories: ['education', 'productivity'],
        icons: [
          {
            src: '/nong-liming/pwa-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
          {
            src: '/nong-liming/maskable-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/nong-liming/screenshot-vertical.svg',
            sizes: '1080x1920',
            type: 'image/svg+xml',
            form_factor: 'narrow',
          },
          {
            src: '/nong-liming/screenshot-horizontal.svg',
            sizes: '1920x1080',
            type: 'image/svg+xml',
            form_factor: 'wide',
          },
        ],
        shortcuts: [
          {
            name: 'Daily Warmup',
            short_name: 'Warmup',
            description: 'Jump into a 5-minute phonetics drill.',
            url: '/nong-liming/?screen=warmup',
            icons: [
              {
                src: '/nong-liming/pwa-icon.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
              },
            ],
          },
          {
            name: 'Script Map',
            short_name: 'Script Map',
            description: 'Browse Thai-to-Indic character mapping.',
            url: '/nong-liming/?screen=script-map',
          },
          {
            name: 'Progress',
            short_name: 'Progress',
            description: 'See your weekly learning streaks.',
            url: '/nong-liming/?screen=progress',
          },
        ],
        prefer_related_applications: false,
        related_applications: [],
      },
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
          {
            urlPattern: ({ request }) => request.destination === 'audio' || request.destination === 'video',
            handler: 'CacheFirst',
            options: {
              cacheName: 'media-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
  },
});
