import { RouterContextProvider, createRequestHandler } from "react-router";
import { setD1Database } from "@hyperlocal/db";
import type { D1Database } from "@cloudflare/workers-types";
import { envContext } from "../app/lib/request-context";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  "production",
);

export default {
  fetch(request: Request, env: Record<string, string>) {
    const provider = new RouterContextProvider();
    provider.set(envContext, env);
    // D1 bindingがあればdb層が優先使用 (なければTurso/fileにfallback)
    setD1Database((env as Record<string, unknown>).DB as D1Database | undefined);
    return requestHandler(request, provider);
  },
};
