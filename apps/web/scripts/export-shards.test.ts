import { createClient } from "@libsql/client";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, expect, it } from "vite-plus/test";

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rootDir = resolve(appDir, "../..");
const dir = mkdtempSync(join(tmpdir(), "hyperlocal-shards-"));
const dbPath = join(dir, "articles.db");
const outDir = join(dir, "shards");

afterAll(() => rmSync(dir, { recursive: true, force: true }));

it("exports only published guides and guide index entries", async () => {
  const client = createClient({ url: `file:${dbPath}` });
  try {
    await client.executeMultiple(readFileSync(join(rootDir, "packages/db/schema.sql"), "utf8"));
    for (const [sceneId, status] of [
      ["morning-cafe", "published"],
      ["lunch-spot", "draft"],
    ]) {
      await client.execute({
        sql: `INSERT INTO area_articles
          (id, city_id, area_id, scene_id, language, title, content, compiled_code, status, metadata, updated_at)
          VALUES (?, 'tokyo', 'shibuya', ?, 'en', ?, '# Fictional', '', ?, '{}', CURRENT_TIMESTAMP)`,
        args: [sceneId, sceneId, status, status],
      });
    }
  } finally {
    client.close();
  }

  const staleGuide = join(outDir, "test/guide/en/shibuya/lunch-spot.json");
  mkdirSync(dirname(staleGuide), { recursive: true });
  writeFileSync(staleGuide, '{"status":"draft"}');
  writeFileSync(
    join(outDir, "manifest.json"),
    JSON.stringify({
      version: "test",
      files: { "guide/en/shibuya/lunch-spot.json": "old-hash" },
      counts: { guide: 1 },
      bytes: 18,
    }),
  );

  execFileSync(
    join(appDir, "node_modules/.bin/tsx"),
    ["scripts/export-shards.ts", "--out", outDir, "--version", "test", "--only", "guide-index"],
    {
      cwd: appDir,
      env: {
        PATH: process.env.PATH ?? "",
        HOME: process.env.HOME ?? "",
        GA_TRACKING_ID: "",
        TURSO_DATABASE_URL: "",
        DATABASE_URL: `file:${dbPath}`,
        TURSO_AUTH_TOKEN: "",
        R2_ACCOUNT_ID: "",
        R2_BUCKET_NAME: "",
        R2_ACCESS_KEY_ID: "",
        R2_SECRET_ACCESS_KEY: "",
      },
    },
  );

  expect(existsSync(join(outDir, "test/guide/en/shibuya/morning-cafe.json"))).toBe(true);
  expect(existsSync(join(outDir, "test/guide/en/shibuya/lunch-spot.json"))).toBe(false);
  const manifest = JSON.parse(readFileSync(join(outDir, "manifest.json"), "utf8"));
  expect(manifest.files).not.toHaveProperty("guide/en/shibuya/lunch-spot.json");
  expect(
    JSON.parse(readFileSync(join(outDir, "test/guide-index/en/shibuya.json"), "utf8")),
  ).toEqual([{ sceneId: "morning-cafe", title: "published", status: "published" }]);
});
