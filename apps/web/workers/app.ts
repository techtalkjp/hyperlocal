import { createRequestHandler } from 'react-router'

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  'production',
)

let seeded = false

function seedProcessEnv(env: Record<string, unknown>) {
  // One-time bridge: existing code reads config from process.env
  // (root loader, shared db client). Bindings are identical for every
  // request of this worker, so seeding once is safe. Throws loudly if the
  // runtime freezes process.env, instead of running with empty config.
  if (seeded) {
    return
  }
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string' && !(key in process.env)) {
      process.env[key] = value
    }
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in the worker environment')
  }
  seeded = true
}

export default {
  fetch(request: Request, env: Record<string, unknown>) {
    seedProcessEnv(env)
    return requestHandler(request)
  },
}
