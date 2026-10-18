import { describe, expect, it } from "vite-plus/test";
import { restrictTabelogNavigation } from "./safe-tabelog-url";

describe("restrictTabelogNavigation", () => {
  it("rejects an unsafe initial URL", () => {
    const context = { request: { url: "http://127.0.0.1/private" } } as Parameters<
      typeof restrictTabelogNavigation
    >[0];
    expect(() => restrictTabelogNavigation(context, {})).toThrow("Refusing non-Tabelog");
  });

  it("blocks a redirect before the next request is sent", () => {
    const context = { request: { url: "https://tabelog.com/tokyo/list/" } } as Parameters<
      typeof restrictTabelogNavigation
    >[0];
    const options: Parameters<typeof restrictTabelogNavigation>[1] = {};
    restrictTabelogNavigation(context, options);
    if (typeof options.followRedirect !== "function") throw new Error("redirect hook missing");
    expect(
      options.followRedirect({
        url: "https://tabelog.com/tokyo/list/",
        headers: { location: "http://169.254.169.254/latest/meta-data/" },
      } as Parameters<typeof options.followRedirect>[0]),
    ).toBe(false);
    expect(
      options.followRedirect({
        url: "https://tabelog.com/tokyo/list/",
        headers: { location: "/tokyo/list/2/" },
      } as Parameters<typeof options.followRedirect>[0]),
    ).toBe(true);
  });
});
