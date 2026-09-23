import { areas } from "@hyperlocal/consts";
import { defineCommand } from "citty";
import consola from "consola";
import { CheerioCrawler, Dataset, log } from "crawlee";
import { HandlerLabel, router } from "./handlers";

export default defineCommand({
  meta: {
    name: "crawl-tabelog",
    description: "食べログのデータをクロールする",
  },
  args: {
    delay: {
      type: "string",
      description: "リクエスト間の遅延（秒）",
      default: undefined,
    },
    max: {
      type: "string",
      description: "最大リクエスト数",
      default: undefined,
    },
    all: {
      type: "boolean",
      description: "全てのエリアをクロールする (既存データセットをパージしてから)",
    },
    area: {
      type: "string",
      description: "エリアIDをカンマ区切りで指定 (既存データセットに追記。パージしない)",
      default: undefined,
    },
  },
  run: async ({ args }) => {
    const delay = args.delay ? Number.parseInt(args.delay, 10) : undefined;
    const maxRequest = args.max ? Number.parseInt(args.max, 10) : undefined;
    const areaIds = args.area
      ? args.area
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    await crawlTabelog({ delay, maxRequest, all: args.all }, areaIds);
  },
});

const crawlTabelog = async (
  opts: {
    delay?: number;
    maxRequest?: number;
    all?: boolean;
  },
  areaIds: string[],
) => {
  log.setLevel(log.LEVELS.INFO);
  if (!opts.all && areaIds.length === 0) {
    consola.error("No area ids specified");
    consola.info("Available area ids:");
    for (const area of areas) {
      consola.info(`- ${area.areaId}`);
    }
    return;
  }

  const crawler = new CheerioCrawler({
    requestHandler: router,
    maxRequestsPerCrawl: opts.maxRequest,
    sameDomainDelaySecs: opts.delay,
  });

  // --all のときだけデータセットをパージ。エリア指定時は追記し、
  // 重複は duckdb 側 (crawled_restaurants view) で url+area の最新を採る
  if (opts.all) {
    const restaurantDataset = await Dataset.open("restaurant");
    await restaurantDataset.drop();
    const reviewDataset = await Dataset.open("review");
    await reviewDataset.drop();
  }

  const areaIdSet = new Set(areaIds);
  const unknown = areaIds.filter((id) => !areas.some((a) => a.areaId === id));
  if (unknown.length > 0) {
    consola.error(`Unknown area ids: ${unknown.join(", ")}`);
    return;
  }
  const requests = areas
    .filter((area) => opts.all || areaIdSet.has(area.areaId))
    .map((area) => ({
      url: area.tabelogUrl,
      label: HandlerLabel.RESTAURANT_LIST,
      userData: { area: area.areaId },
    }));

  if (requests.length > 0) {
    await crawler.addRequests(requests);
  }

  await crawler.run();
};
