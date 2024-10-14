import { vitePlugin as remix } from '@remix-run/dev'
import { vercelPreset } from '@vercel/remix/vite'
import { flatRoutes } from 'remix-flat-routes'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

declare module '@remix-run/server-runtime' {
  interface Future {
    unstable_singleFetch: true
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        unstable_lazyRouteDiscovery: true,
        unstable_singleFetch: true,
        unstable_optimizeDeps: true,
      },
      presets: [vercelPreset()],
      routes: (defineRoutes) =>
        flatRoutes('routes', defineRoutes, {
          ignoredRouteFiles: ['**/index.ts'],
        }),
    }),
    tsconfigPaths(),
  ],
})