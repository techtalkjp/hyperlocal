import { load } from "cheerio";
import { describe, expect, it } from "vite-plus/test";
import { restaurantListHandler } from "./restaurant-list";

const run = async (html: string) => {
  const requests: { url: string; label: string }[] = [];
  const context = {
    $: load(html),
    request: {
      loadedUrl: "https://tabelog.com/tokyo/list/",
      userData: { area: "tokyo" },
    },
    crawler: {
      addRequests: async (items: typeof requests) => {
        requests.push(...items);
      },
    },
  } as unknown as Parameters<typeof restaurantListHandler>[0];
  await restaurantListHandler(context);
  return requests;
};

describe("restaurantListHandler", () => {
  it("enqueues only HTTPS Tabelog links from a page", async () => {
    const requests = await run(`
      <a class="list-rst__rst-name-target" href="/tokyo/123/">valid</a>
      <a class="list-rst__rst-name-target" href="http://127.0.0.1/private">loopback</a>
      <a class="list-rst__rst-name-target" href="https://tabelog.com.evil.example/">external</a>
      <a class="c-pagination__arrow--next" href="/tokyo/list/2/">next</a>
    `);
    expect(requests.map((request) => request.url)).toEqual([
      "https://tabelog.com/tokyo/123/",
      "https://tabelog.com/tokyo/list/2/",
    ]);
  });

  it("rejects a pagination link to another host", async () => {
    const requests = await run(
      `<a class="c-pagination__arrow--next" href="https://internal.example/private">next</a>`,
    );
    expect(requests).toEqual([]);
  });
});
