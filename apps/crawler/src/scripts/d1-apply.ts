import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// export-sql.ts の出力 (--upsert) を D1 REST API で本番に適用する。
// 使い方: pnpm tsx src/scripts/d1-apply.ts --dir /tmp/d1sync
//
// wrangler d1 execute --file を使わない理由:
//   - 数十MBのファイルは import API が長時間化し、途中で認証エラーになる
//   - wrangler 側の SQL 分割器が JSON 列内のバックスラッシュで誤動作する
// ここでは行頭の INSERT INTO を文境界として自前で分割し、40文ずつ /query に投げる。
// 認証は wrangler login 済みの OAuth トークン (~/.wrangler/config/default.toml) を流用する。

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID ?? "91ff95bcb91fbfa1b1c5c356262b1fe4";
const DBID = process.env.D1_DATABASE_ID ?? "3af44920-5ced-4dde-9d22-18f3e20eada3";
const BATCH = 40;
// FK 親 -> 子の順
const ORDER = [
  "user",
  "account",
  "session",
  "verification",
  "places",
  "place_listings",
  "localized_places",
  "area_articles",
];

const args = process.argv.slice(2);
const dir = args[args.indexOf("--dir") + 1];
if (!dir || args.indexOf("--dir") < 0) throw new Error("--dir <export-sql out dir> is required");

const readToken = (): string => {
  if (process.env.CLOUDFLARE_API_TOKEN) return process.env.CLOUDFLARE_API_TOKEN;
  // OAuth トークンは約1時間で切れる。wrangler を一度走らせて config を更新させる
  try {
    execSync("npx wrangler whoami", { stdio: "ignore" });
  } catch {
    // whoami が失敗しても config の既存トークンで試す
  }
  const cfg = fs.readFileSync(`${process.env.HOME}/.wrangler/config/default.toml`, "utf8");
  const m = cfg.match(/^oauth_token = "([^"]+)"/m);
  if (!m) throw new Error("no oauth_token in wrangler config; run `wrangler login`");
  return m[1];
};
const token = readToken();

const rank = (f: string) =>
  ORDER.findIndex((t) => f.startsWith(`${t}.sql`) || f.startsWith(`${t}-`));
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

let total = 0;
for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), "utf8").replace(/\n$/, "");
  if (!text) continue;
  const stmts = text.split(/\n(?=INSERT INTO ")/);
  for (let i = 0; i < stmts.length; i += BATCH) {
    const sql = stmts.slice(i, i + BATCH).join("\n");
    for (let attempt = 1; ; attempt++) {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/d1/database/${DBID}/query`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ sql }),
        },
      );
      const json = (await res.json().catch(() => ({}))) as { success?: boolean; errors?: unknown };
      if (res.ok && json.success) break;
      const msg = JSON.stringify(json.errors ?? json).slice(0, 300);
      if (attempt >= 3) throw new Error(`FAILED ${f} batch@${i}: ${res.status} ${msg}`);
      console.error(`retry ${f} batch@${i}: ${res.status} ${msg}`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  total += stmts.length;
  console.log(`${f}: ${stmts.length} statements`);
}
console.log(`done: ${total} statements`);
