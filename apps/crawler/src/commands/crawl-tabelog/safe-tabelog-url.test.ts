import { describe, expect, it } from "vite-plus/test";
import { safeTabelogUrl } from "./safe-tabelog-url";

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
