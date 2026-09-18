import { defineCommand, runMain } from "citty";
import consola from "consola";
import { config } from "dotenv";

config();

const main = defineCommand({
  meta: {
    name: "crawler",
    version: "0.1.0",
    description: "crawler cli",
  },
  setup: () => {
    consola.debug("setup");
  },
  cleanup: () => {
    consola.debug("cleanup");
  },
  subCommands: {
    // 01. 食べログのデータをクロールする
    crawlTabelog: (await import("./commands/crawl-tabelog")).default,
    // 02. 食べログのデータをリスティング用のデータに変換する。ランキング外のデータは除外される
    transform: (await import("./commands/transform")).default,
    // 03. 翻訳してローカライズする
    localize: (await import("./commands/localize")).default,
    // 04. Tabelog直結でstagingに取込 (Google不使用)
    ingestTabelog: (await import("./commands/ingest-tabelog")).default,
  },
});

await runMain(main);
