import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

function asNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devPort = asNumber(env.VITE_DEV_PORT, 5173)
  const hmrPort = asNumber(env.VITE_HMR_PORT, devPort)
  const hmrClientPort = asNumber(env.VITE_HMR_CLIENT_PORT, hmrPort)
  const usePolling = env.VITE_HMR_POLLING === 'true'
  const pollInterval = asNumber(env.VITE_HMR_POLL_INTERVAL, 250)

  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
            i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-icu'],
          },
        },
      },
    },
    server: {
      host: env.VITE_DEV_HOST || '0.0.0.0',
      port: devPort,
      strictPort: true,
      hmr: env.VITE_HMR_HOST
        ? {
            host: env.VITE_HMR_HOST,
            port: hmrPort,
            clientPort: hmrClientPort,
            protocol: 'ws',
          }
        : undefined,
      watch: usePolling ? { usePolling: true, interval: pollInterval } : undefined,
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setupTests.ts',
      globals: true,
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        thresholds: {
          statements: 62,
          lines: 62,
          functions: 62,
        },
      },
    },
  }
})
