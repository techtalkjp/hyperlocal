import { expect, it, vi } from "vite-plus/test";
import { webTransport } from "./web-transport";

it("redirects the production HTTP origin before handling a bearer request", async () => {
  const next = vi.fn(async () => new Response("secret"));
  const response = await webTransport(
    new Request("http://tokyo.hyper-local.app/api/internal/purge?path=%2Farea"),
    next,
  );
  expect(response.status).toBe(308);
  expect(response.headers.get("Location")).toBe(
    "https://tokyo.hyper-local.app/api/internal/purge?path=%2Farea",
  );
  expect(next).not.toHaveBeenCalled();
});

it("adds HSTS to production HTTPS responses", async () => {
  const response = await webTransport(
    new Request("https://tokyo.hyper-local.app/"),
    async () => new Response("OK"),
  );
  expect(response.headers.get("Strict-Transport-Security")).toBe("max-age=31536000");
});

it("keeps the local audit origin reachable over HTTP", async () => {
  const response = await webTransport(
    new Request("http://host.docker.internal:4174/"),
    async () => new Response("OK"),
  );
  expect(response.status).toBe(200);
});
