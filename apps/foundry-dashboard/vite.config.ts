import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import path from 'path';

export default defineConfig({
  build: {
    sourcemap: true, // Required for Sentry source maps
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['@tanstack/react-router'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-trpc': ['@trpc/client', '@trpc/react-query'],
          'vendor-zod': ['zod'],
          'vendor-recharts': ['recharts'],
        },
      },
    },
  },
  plugins: [
    TanStackRouterVite({
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    // Sentry plugin uploads source maps during build
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Only upload in CI/production builds
      disable: !process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
      '/trpc': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/e2e/**', '**/node_modules/**'],
  },
});
