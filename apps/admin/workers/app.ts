import { RouterContextProvider, createRequestHandler } from "react-router";
import { setD1Database } from "@hyperlocal/db";
import type { D1Database } from "@cloudflare/workers-types";
import { envContext } from "../app/lib/request-context";
import { ADMIN_HOST, adminTransport } from "../app/lib/admin-transport";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  "production",
);

export default {
  fetch(
    request: Request,
    env: Record<string, unknown> & { ASSETS: { fetch(request: Request): Promise<Response> } },
  ) {
    const provider = new RouterContextProvider();
    const productionHost = new URL(request.url).hostname === ADMIN_HOST;
    const config = Object.fromEntries(
      Object.entries(env).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );
    provider.set(
      envContext,
      productionHost ? { ...config, BETTER_AUTH_URL: `https://${ADMIN_HOST}` } : config,
    );
    // D1 bindingがあればdb層が優先使用 (なければTurso/fileにfallback)
    setD1Database((env as Record<string, unknown>).DB as D1Database | undefined);
    return adminTransport(request, async () => {
      if (request.method === "GET" || request.method === "HEAD") {
        const assetUrl = new URL(request.url);
        assetUrl.protocol = "https:";
        const asset = await env.ASSETS.fetch(new Request(assetUrl, request));
        if (asset.status !== 404) return asset;
      }
      return requestHandler(request, provider);
    });
  },
};
