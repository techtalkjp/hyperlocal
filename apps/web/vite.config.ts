import { cloudflare } from '@cloudflare/vite-plugin'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // Disabled under vitest: the plugin requires the dev deps optimizer.
    ...(process.env.VITEST
      ? []
      : [cloudflare({ viteEnvironment: { name: 'ssr' } })]),
    tailwindcss(),
    reactRouter(),
  ],
  resolve: { tsconfigPaths: true },
})
