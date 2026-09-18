import { createDb, selfIdFromGoogleId, selfIdFromSourceUri } from "@hyperlocal/db";
import fs from "node:fs";
import { sql } from "kysely";

// Google Place ID -> 自社ID への移行 (冪等ではないため --apply でのみ実行)
// 使い方:
//   DRY-RUN:  pnpm tsx src/scripts/migrate-place-ids.ts --mapping /tmp/mapping.json
//   実行:     DATABASE_URL=... pnpm tsx src/scripts/migrate-place-ids.ts --mapping /tmp/mapping.json --apply
// DB接続は DATABASE_URL / TURSO_AUTH_TOKEN 環境変数 (.env) を見る。

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const mappingPath = flag("--mapping");
const apply = args.includes("--apply");
if (!mappingPath) {
  throw new Error("--mapping <path> is required");
}

const db = createDb(process.env.DATABASE_URL ?? "", process.env.TURSO_AUTH_TOKEN ?? "");

const places = await db.selectFrom("places").select(["id", "sourceUri"]).execute();

// すでに移行済み (pl_ かつ google_place_id あり) は除外
const targets = places.filter((p) => !p.id.startsWith("pl_"));

const mapping = new Map<string, string>();
for (const p of targets) {
  const next = p.sourceUri ? selfIdFromSourceUri(p.sourceUri) : selfIdFromGoogleId(p.id);
  const prev = [...mapping.entries()].find(([, v]) => v === next);
  if (prev) {
    throw new Error(`collision: ${p.id} and ${prev[0]} -> ${next}`);
  }
  mapping.set(p.id, next);
}

console.log(`targets: ${targets.length} / ${places.length}`);
fs.writeFileSync(mappingPath, JSON.stringify(Object.fromEntries(mapping), null, 2));
console.log(`mapping written: ${mappingPath}`);

if (!apply) {
  console.log("dry-run only (pass --apply to execute)");
  process.exit(0);
}

await db.transaction().execute(async (tx) => {
  for (const [oldId, newId] of mapping) {
    // 親を先に更新 (両FKとも ON UPDATE CASCADE なので子に伝播)。
    // 明示的子更新は enforcement off 環境向けの予備。
    await tx
      .updateTable("places")
      .set({ id: newId, googlePlaceId: oldId })
      .where("id", "==", oldId)
      .execute();
    await tx
      .updateTable("placeListings")
      .set({ placeId: newId })
      .where("placeId", "==", oldId)
      .execute();
    await tx
      .updateTable("localizedPlaces")
      .set({ placeId: newId })
      .where("placeId", "==", oldId)
      .execute();
    await tx
      .updateTable("areaArticles")
      .set({ content: sql`REPLACE(content, ${oldId}, ${newId})` })
      .where("content", "like", `%${oldId}%`)
      .execute();
  }
});
console.log("migration applied");
process.exit(0);
