/**
 * Search Console API 連携スクリプト(運用・定期取得用)
 *
 * 使い方:
 *   pnpm --filter @hyperlocal/web seo:sc -- perf --days 28
 *   pnpm --filter @hyperlocal/web seo:sc -- sitemaps
 *   pnpm --filter @hyperlocal/web seo:sc -- inspect
 *   pnpm --filter @hyperlocal/web seo:sc -- submit
 *   pnpm --filter @hyperlocal/web seo:sc -- all --days 28
 *
 * 認証(サービスアカウント):
 *   GOOGLE_SERVICE_ACCOUNT_FILE=/path/to/sa-key.json
 *   または GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
 * 対象プロパティ:
 *   SC_SITE_URL=sc-domain:hyper-local.app (既定)
 *
 * 初回設定は docs 参照: GCPで Search Console API + URL Inspection API を有効化し、
 * サービスアカウントのメールを Search Console の「設定 > ユーザーと権限」に
 * 所有者として追加する。
 */
import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";

const args = process.argv.slice(2).filter((a) => a !== "--");
const getArg = (name: string, fallback?: string) => {
  const i = args.indexOf(`--${name}`);
  if (i >= 0 && args[i + 1] && !args[i + 1].startsWith("--")) return args[i + 1];
  return fallback;
};
const hasFlag = (name: string) => args.includes(`--${name}`);

const COMMAND = args[0] && !args[0].startsWith("--") ? args[0] : "all";
const SITE_URL = getArg("site") ?? process.env.SC_SITE_URL ?? "sc-domain:hyper-local.app";
const DAYS = Number(getArg("days") ?? "28");
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const SNAPSHOT_DIR = getArg("snapshot-dir") ?? path.resolve(__dirname, "../../../data/seo");

// sitemaps.submit(再送信)が書込みのためフルスコープ(読取りも含む)
const SCOPES = ["https://www.googleapis.com/auth/webmasters"];

function loadAuth() {
  const file = process.env.GOOGLE_SERVICE_ACCOUNT_FILE;
  const inline = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!file && !inline) {
    console.error(`# seo:sc 設定不足
サービスアカウントの鍵が必要です。どちらかを設定してください:
  export GOOGLE_SERVICE_ACCOUNT_FILE=/path/to/sa-key.json
  export GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

手順:
  1. GCPコンソールで Search Console API と URL Inspection API を有効化
  2. サービスアカウントを作成しJSON鍵を発行
  3. Search Console「設定 > ユーザーと権限」で鍵のメールアドレスを所有者追加`);
    process.exit(2);
  }
  return new google.auth.GoogleAuth({
    keyFile: file,
    credentials: inline ? JSON.parse(inline) : undefined,
    scopes: SCOPES,
  });
}

const toISODate = (d: Date) => d.toISOString().slice(0, 10);

function ensureSnapshotDir() {
  if (!fs.existsSync(SNAPSHOT_DIR)) fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
}

function saveSnapshot(name: string, payload: unknown) {
  ensureSnapshotDir();
  const file = path.join(SNAPSHOT_DIR, `${name}-${toISODate(new Date())}.json`);
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  return file;
}

function loadLatestSnapshot(prefix: string): { file: string; data: any } | null {
  if (!fs.existsSync(SNAPSHOT_DIR)) return null;
  const files = fs
    .readdirSync(SNAPSHOT_DIR)
    .filter((f) => f.startsWith(prefix) && f.endsWith(".json"))
    .sort();
  if (files.length === 0) return null;
  const file = path.join(SNAPSHOT_DIR, files[files.length - 1]);
  // 今日分が既にあれば1つ前を比較対象にする
  const today = `${prefix}-${toISODate(new Date())}.json`;
  const target =
    files[files.length - 1] === today && files.length > 1
      ? files[files.length - 2]
      : files[files.length - 1];
  return {
    file: path.join(SNAPSHOT_DIR, target),
    data: JSON.parse(fs.readFileSync(path.join(SNAPSHOT_DIR, target), "utf8")),
  };
}

const fmt = (n: number | null | undefined) => Number(n ?? 0).toLocaleString("en-US");
const diff = (cur: number | null | undefined, prev?: number | null) => {
  if (prev == null || cur == null) return "";
  const d = cur - prev;
  const sign = d > 0 ? "+" : "";
  return ` (${sign}${fmt(d)} vs 前回)`;
};

async function cmdPerf() {
  const auth = loadAuth();
  const sc = google.searchconsole({ version: "v1", auth });
  const end = new Date();
  end.setDate(end.getDate() - 2); // SCデータは2〜3日遅延
  const start = new Date(end);
  start.setDate(start.getDate() - (DAYS - 1));

  const base = {
    siteUrl: SITE_URL,
    requestBody: {
      startDate: toISODate(start),
      endDate: toISODate(end),
      rowLimit: 100,
    },
  } as const;

  const [byDate, byPage, byQuery] = await Promise.all([
    sc.searchanalytics.query({
      ...base,
      requestBody: { ...base.requestBody, dimensions: ["date"] },
    }),
    sc.searchanalytics.query({
      ...base,
      requestBody: {
        ...base.requestBody,
        dimensions: ["page"],
        rowLimit: 20,
      },
    }),
    sc.searchanalytics.query({
      ...base,
      requestBody: {
        ...base.requestBody,
        dimensions: ["query"],
        rowLimit: 20,
      },
    }),
  ]);

  const totals = (byDate.data.rows ?? []).reduce(
    (acc: { clicks: number; impressions: number }, r) => ({
      clicks: acc.clicks + (r.clicks ?? 0),
      impressions: acc.impressions + (r.impressions ?? 0),
    }),
    { clicks: 0, impressions: 0 },
  );

  const payload = {
    siteUrl: SITE_URL,
    period: { start: toISODate(start), end: toISODate(end) },
    totals,
    byPage: byPage.data.rows ?? [],
    byQuery: byQuery.data.rows ?? [],
  };
  const prev = loadLatestSnapshot("sc-perf");
  const file = saveSnapshot("sc-perf", payload);

  console.log(`# Search Console 実績 (${payload.period.start}〜${payload.period.end})`);
  console.log(
    `- clicks: ${fmt(Math.round(totals.clicks))}${diff(Math.round(totals.clicks), prev ? Math.round(prev.data.totals.clicks) : undefined)}`,
  );
  console.log(
    `- impressions: ${fmt(Math.round(totals.impressions))}${diff(Math.round(totals.impressions), prev ? Math.round(prev.data.totals.impressions) : undefined)}`,
  );
  console.log(`- snapshot: ${file}`);
  console.log("");
  console.log("## 上位ページ(top 10)");
  for (const r of (byPage.data.rows ?? []).slice(0, 10)) {
    console.log(
      `- ${Math.round(r.clicks ?? 0)}click / ${fmt(Math.round(r.impressions ?? 0))}imp / ${Number(r.position ?? 0).toFixed(1)}位 ${r.keys?.[0]}`,
    );
  }
  console.log("");
  console.log("## 上位クエリ(top 10)");
  for (const r of (byQuery.data.rows ?? []).slice(0, 10)) {
    console.log(
      `- ${Math.round(r.clicks ?? 0)}click / ${fmt(Math.round(r.impressions ?? 0))}imp / ${Number(r.position ?? 0).toFixed(1)}位 ${r.keys?.[0]}`,
    );
  }
}

async function cmdSitemaps() {
  const auth = loadAuth();
  const sc = google.searchconsole({ version: "v1", auth });
  const res = await sc.sitemaps.list({ siteUrl: SITE_URL });
  const items = res.data.sitemap ?? [];
  const payload = {
    siteUrl: SITE_URL,
    fetchedAt: new Date().toISOString(),
    sitemaps: items,
  };
  const file = saveSnapshot("sc-sitemaps", payload);
  console.log(`# Sitemaps (${items.length}件)`);
  for (const s of items) {
    console.log(
      `- ${s.path}: 検出${s.contents?.[0]?.submitted ?? "?"}件 / 最終読込 ${s.lastDownloaded ?? "(なし)"} / エラー ${s.errors ?? 0} 警告 ${s.warnings ?? 0}`,
    );
  }
  console.log(`- snapshot: ${file}`);
}

async function cmdSubmit() {
  const auth = loadAuth();
  const sc = google.searchconsole({ version: "v1", auth });
  const feedpath = getArg("feedpath") ?? "https://tokyo.hyper-local.app/sitemap.xml";
  await sc.sitemaps.submit({ siteUrl: SITE_URL, feedpath });
  console.log(`# Sitemap resubmitted: ${feedpath}`);
  const res = await sc.sitemaps.list({ siteUrl: SITE_URL });
  const hit = (res.data.sitemap ?? []).find((s) => s.path === feedpath);
  if (hit) {
    console.log(
      `- 最終読込: ${hit.lastDownloaded ?? "(取込待ち)"} / 検出: ${hit.contents?.[0]?.submitted ?? "?"}件`,
    );
  } else {
    console.log("- 一覧に未反映(数分後に sitemaps で確認してください)");
  }
}

const DEFAULT_INSPECT_URLS = (origin: string) => [
  `${origin}/`,
  `${origin}/ja/`,
  `${origin}/zh-cn/`,
  `${origin}/ko/`,
  `${origin}/zh-tw/`,
];

async function cmdInspect() {
  const auth = loadAuth();
  const sc = google.searchconsole({ version: "v1", auth });
  const extra = args
    .map((a, i) => (a === "--url" ? args[i + 1] : null))
    .filter(Boolean) as string[];
  const origin = getArg("origin") ?? "https://tokyo.hyper-local.app";
  const urls = extra.length > 0 ? extra : DEFAULT_INSPECT_URLS(origin);

  // Inspection API は日次quota制だが、数件のバーストは問題ないため並列実行
  // （順序は入力順に復元）。大量URLの一括検査が必要になったら直列に戻すこと。
  const inspected = await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await sc.urlInspection.index.inspect({
          requestBody: { inspectionUrl: url, siteUrl: SITE_URL },
        });
        return { url, result: res.data.inspectionResult ?? {} };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return { url, result: null, error: msg };
      }
    }),
  );
  const results: Array<Record<string, unknown>> = [];
  for (const { url, result, error } of inspected) {
    if (!result) {
      results.push({ url, error });
      console.log(`- ${url}: ERROR ${(error ?? "").slice(0, 160)}`);
      continue;
    }
    const r = result;
    results.push({ url, ...r });
    console.log(
      `- ${url}: coverage=${r.indexStatusResult?.coverageState ?? "?"} crawl=${r.indexStatusResult?.lastCrawlTime ?? "?"} indexed=${r.indexStatusResult?.verdict ?? "?"}`,
    );
  }
  const file = saveSnapshot("sc-inspect", {
    siteUrl: SITE_URL,
    fetchedAt: new Date().toISOString(),
    results,
  });
  console.log(`- snapshot: ${file}`);
  if (hasFlag("help") || urls.length === 0) {
    console.log("任意URLの追加: -- --url https://... --url https://...");
  }
}

const main = async () => {
  if (COMMAND === "perf" || COMMAND === "all") await cmdPerf();
  if (COMMAND === "sitemaps" || COMMAND === "all") await cmdSitemaps();
  if (COMMAND === "submit") await cmdSubmit();
  if (COMMAND === "inspect" || COMMAND === "all") await cmdInspect();
  if (!["perf", "sitemaps", "submit", "inspect", "all"].includes(COMMAND)) {
    console.error(`unknown command: ${COMMAND} (perf|sitemaps|submit|inspect|all)`);
    process.exit(1);
  }
};

await main();
