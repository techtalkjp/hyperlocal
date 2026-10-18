import { describe, expect, it, vi } from "vite-plus/test";
import { adminTransport } from "./admin-transport";

describe("adminTransport", () => {
  it("redirects production HTTP before invoking the app", async () => {
    const next = vi.fn(async () => new Response("secret"));
    const response = await adminTransport(
      new Request("http://admin.hyper-local.app/login?returnTo=%2Farticles"),
      next,
    );
    expect(response.status).toBe(308);
    expect(response.headers.get("Location")).toBe(
      "https://admin.hyper-local.app/login?returnTo=%2Farticles",
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("adds HSTS to production HTTPS responses", async () => {
    const response = await adminTransport(
      new Request("https://admin.hyper-local.app/login"),
      async () => new Response("OK", { headers: { "Set-Cookie": "session=example; Secure" } }),
    );
    expect(response.headers.get("Strict-Transport-Security")).toBe("max-age=31536000");
    expect(response.headers.get("Set-Cookie")).toBe("session=example; Secure");
  });

  it("allows the isolated local audit host over HTTP", async () => {
    const response = await adminTransport(
      new Request("http://host.docker.internal:4176/login"),
      async () => new Response("OK"),
    );
    expect(response.status).toBe(200);
    expect(response.headers.has("Strict-Transport-Security")).toBe(false);
  });
});
