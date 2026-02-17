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
      registerType: 'prompt',
      injectRegister: null,
      includeAssets: [
        'favicon.svg',
        'pwa-icon.svg',
        'maskable-icon.svg',
        'images/Screenshot-vertical.png',
        'images/Screenshot-horizontal.png',
        'sql-wasm.wasm',
      ],
      manifest: {
        name: 'NongLiMing',
        short_name: 'NongLiMing',
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
            src: '/nong-liming/images/Screenshot-vertical.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow',
          },
          {
            src: '/nong-liming/images/Screenshot-horizontal.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
          },
        ],
        shortcuts: [
          {
            name: 'Study Flashcards',
            short_name: 'Flashcards',
            description: 'Review your vocabulary decks.',
            url: '/nong-liming/decks',
            icons: [
              {
                src: '/nong-liming/pwa-icon.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
              },
            ],
          },
          {
            name: 'Reference',
            short_name: 'Reference',
            description: 'Browse Thai consonants, vowels, and tones.',
            url: '/nong-liming/reference',
          },
          {
            name: 'Word Builder',
            short_name: 'Builder',
            description: 'Practice building Thai syllables.',
            url: '/nong-liming/builder',
          },
          {
            name: 'Statistics',
            short_name: 'Stats',
            description: 'View your learning progress.',
            url: '/nong-liming/stats',
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
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-cache',
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'image-cache',
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
