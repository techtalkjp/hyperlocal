import { createContext } from "react-router";

/**
 * Cloudflare Workers bindings + vars for the admin app.
 * In local Node dev (`vite dev`) there are no bindings; loaders fall back to
 * process.env via getEnv. On Workers, workers/app.ts puts the bindings here.
 */
export interface AdminEnv {
  DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
  BETTER_AUTH_URL?: string;
  BETTER_AUTH_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_GENERATIVE_AI_API_KEY?: string;
  GOOGLE_MAPS_API_KEY?: string;
  ADMIN_EMAILS?: string;
  WEB_ORIGIN?: string;
  PURGE_SECRET?: string;
  [key: string]: string | undefined;
}

export const envContext = createContext<AdminEnv>();

/** Read AdminEnv from a loader/action/middleware context. */
export function getEnv(
  context: { get: (ctx: typeof envContext) => AdminEnv },
  fallback: NodeJS.ProcessEnv = process.env,
): AdminEnv {
  try {
    return context.get(envContext);
  } catch {
    return fallback as AdminEnv;
  }
}
