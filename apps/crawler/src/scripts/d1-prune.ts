import { db } from "@hyperlocal/db";
import { execSync } from "node:child_process";
import fs from "node:fs";

// staging (DATABASE_URL) に無くなった行を D1 から削除する (export-sql --upsert は削除を運ばないため)。
// 対象: place_listings, localized_places (自然キー)。places は残しても害が無いので触らない。
// 使い方: pnpm tsx --env-file=.env src/scripts/d1-prune.ts [--dry-run]

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID ?? "91ff95bcb91fbfa1b1c5c356262b1fe4";
const DBID = process.env.D1_DATABASE_ID ?? "3af44920-5ced-4dde-9d22-18f3e20eada3";
const dryRun = process.argv.includes("--dry-run");

const readToken = (): string => {
  if (process.env.CLOUDFLARE_API_TOKEN) return process.env.CLOUDFLARE_API_TOKEN;
  try {
    execSync("npx wrangler whoami", { stdio: "ignore" });
  } catch {
    // fall through
  }
  const cfg = fs.readFileSync(`${process.env.HOME}/.wrangler/config/default.toml`, "utf8");
  const m = cfg.match(/^oauth_token = "([^"]+)"/m);
  if (!m) throw new Error("no oauth_token; run `wrangler login`");
  return m[1];
};
const token = readToken();

const d1 = async <T>(sql: string): Promise<T[]> => {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/d1/database/${DBID}/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sql }),
    },
  );
  const json = (await res.json()) as {
    success: boolean;
    result?: { results: T[] }[];
    errors?: unknown;
  };
  if (!res.ok || !json.success) throw new Error(`D1 ${res.status}: ${JSON.stringify(json.errors)}`);
  return json.result?.[0]?.results ?? [];
};

const TABLES: { table: string; cols: string[] }[] = [
  {
    table: "place_listings",
    cols: ["city_id", "area_id", "category_id", "ranking_type", "place_id"],
  },
  {
    table: "localized_places",
    cols: ["city_id", "area_id", "category_id", "ranking_type", "place_id", "language"],
  },
];
const lit = (v: unknown) => `'${String(v).replaceAll("'", "''")}'`;

for (const { table, cols } of TABLES) {
  const colList = cols.join(", ");
  const remote: Record<string, string>[] = [];
  for (let offset = 0; ; offset += 5000) {
    const page = await d1<Record<string, string>>(
      `SELECT ${colList} FROM "${table}" ORDER BY ${colList} LIMIT 5000 OFFSET ${offset}`,
    );
    remote.push(...page);
    if (page.length < 5000) break;
  }
  const localRows = await db
    .selectFrom(table as "placeListings")
    .select(cols.map((c) => c.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase())) as never)
    .execute();
  const keyOf = (r: Record<string, unknown>) =>
    cols
      .map((c) => r[c] ?? r[c.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase())])
      .join("\u0001");
  const local = new Set((localRows as Record<string, unknown>[]).map(keyOf));
  const gone = remote.filter((r) => !local.has(keyOf(r)));
  console.log(`${table}: remote=${remote.length} local=${local.size} delete=${gone.length}`);
  if (dryRun) continue;
  for (let i = 0; i < gone.length; i += 100) {
    const sql = gone
      .slice(i, i + 100)
      .map(
        (r) =>
          `DELETE FROM "${table}" WHERE ${cols.map((c) => `"${c}"=${lit(r[c])}`).join(" AND ")};`,
      )
      .join("\n");
    await d1(sql);
  }
}
console.log("done");
process.exit(0);
