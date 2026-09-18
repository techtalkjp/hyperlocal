import { RouterContextProvider, createRequestHandler } from "react-router";
import { setD1Database } from "@hyperlocal/db";
import type { D1Database } from "@cloudflare/workers-types";
import { executionContext } from "../app/lib/worker-context";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  "production",
);

let seeded = false;

function seedProcessEnv(env: Record<string, unknown>) {
  // One-time bridge: existing code reads config from process.env
  // (root loader, shared db client). Bindings are identical for every
  // request of this worker, so seeding once is safe. Throws loudly if the
  // runtime freezes process.env, instead of running with empty config.
  if (seeded) {
    return;
  }
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === "string" && !(key in process.env)) {
      process.env[key] = value;
    }
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in the worker environment");
  }
  // D1 bindingがあればdb層が優先使用 (なければTurso/fileにfallback)
  setD1Database(env.DB as D1Database | undefined);
  seeded = true;
}

export default {
  fetch(
    request: Request,
    env: Record<string, unknown>,
    ctx: {
      waitUntil(promise: Promise<unknown>): void;
      passThroughOnException(): void;
    },
  ) {
    seedProcessEnv(env);
    const provider = new RouterContextProvider();
    provider.set(executionContext, {
      waitUntil: ctx.waitUntil.bind(ctx),
      passThroughOnException: ctx.passThroughOnException.bind(ctx),
      cache: (ctx as Record<string, unknown>).cache as never,
    });
    return requestHandler(request, provider);
  },
};
