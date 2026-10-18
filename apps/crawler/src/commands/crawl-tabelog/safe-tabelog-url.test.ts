import { describe, expect, it } from "vite-plus/test";
import { canFollowTabelogRedirect, safeTabelogUrl } from "./safe-tabelog-url";

describe("safeTabelogUrl", () => {
  it("resolves relative links on Tabelog", () => {
    expect(safeTabelogUrl("/tokyo/123/", "https://tabelog.com/tokyo/")).toBe(
      "https://tabelog.com/tokyo/123/",
    );
  });

  it.each([
    "https://tabelog.com.evil.example/path",
    "https://evil.example/path",
    "http://tabelog.com/path",
    "http://127.0.0.1:8787/internal",
    "javascript:alert(1)",
    "",
  ])("rejects a non-Tabelog destination: %s", (value) => {
    expect(safeTabelogUrl(value, "https://tabelog.com/tokyo/")).toBeUndefined();
  });
});

describe("canFollowTabelogRedirect", () => {
  const from = "https://tabelog.com/tokyo/list/";
  it("follows a relative Tabelog redirect", () => {
    expect(canFollowTabelogRedirect("/tokyo/next/", from)).toBe(true);
  });
  it.each([
    "http://127.0.0.1/internal",
    "https://10.0.0.1/internal",
    "https://tabelog.com.evil.example/",
    "http://tabelog.com/",
  ])("blocks an unsafe redirect before its request: %s", (location) => {
    expect(canFollowTabelogRedirect(location, from)).toBe(false);
  });
});
