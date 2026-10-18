import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vite-plus/test";
import { splitExportSql } from "./split-export-sql";

const tables = ["places", "place_listings", "localized_places", "area_articles"];
const sqlFile = (table: string) =>
  table === "localized_places" ? "localized_places-01.sql" : `${table}.sql`;
const schema = `
  CREATE TABLE places (id TEXT PRIMARY KEY, display_name TEXT);
  CREATE TABLE place_listings (city_id TEXT, area_id TEXT, category_id TEXT, ranking_type TEXT,
    place_id TEXT, rank INTEGER, UNIQUE(city_id, area_id, category_id, ranking_type, place_id));
  CREATE TABLE localized_places (city_id TEXT, area_id TEXT, category_id TEXT, ranking_type TEXT,
    place_id TEXT, language TEXT, display_name TEXT,
    UNIQUE(city_id, area_id, category_id, ranking_type, place_id, language));
  CREATE TABLE area_articles (id TEXT PRIMARY KEY, city_id TEXT, area_id TEXT, scene_id TEXT,
    language TEXT, status TEXT, content TEXT, UNIQUE(city_id, area_id, scene_id, language));
  CREATE TABLE user (id TEXT, email TEXT);
`;

describe("export-sql", () => {
  it("exports only content and applies plain and upsert SQL with quoted multiline values", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "hyperlocal-export-sql-"));
    try {
      const sourcePath = path.join(dir, "source.db");
      const source = new DatabaseSync(sourcePath);
      source.exec(schema);
      source.prepare("INSERT INTO places VALUES (?, ?)").run("p1", "Cafe 'A';\nINSERT INTO user");
      source.exec("INSERT INTO place_listings VALUES ('tokyo','asakusa','cafe','rating','p1',1)");
      source.exec(
        "INSERT INTO localized_places VALUES ('tokyo','asakusa','cafe','rating','p1','ja','カフェ')",
      );
      source
        .prepare("INSERT INTO area_articles VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run("a1", "tokyo", "asakusa", "morning", "ja", "published", "First line;\nSecond 'line'");
      source.exec("INSERT INTO user VALUES ('u1','private@example.test')");
      source.close();

      for (const upsert of [false, true]) {
        const out = path.join(dir, upsert ? "upsert" : "plain");
        const result = spawnSync(
          process.execPath,
          [
            "--import",
            "tsx",
            "src/scripts/export-sql.ts",
            "--out",
            out,
            ...(upsert ? ["--upsert"] : []),
          ],
          {
            cwd: process.cwd(),
            env: { ...process.env, DATABASE_URL: `file:${sourcePath}`, TURSO_AUTH_TOKEN: "" },
            encoding: "utf8",
          },
        );
        expect(result.status, result.stderr).toBe(0);
        expect(readdirSync(out).sort()).toEqual(tables.map(sqlFile).sort());

        const target = new DatabaseSync(":memory:");
        target.exec(schema);
        for (const table of tables) {
          for (const statement of splitExportSql(
            readFileSync(path.join(out, sqlFile(table)), "utf8"),
            table,
          )) {
            target.exec(statement);
            if (upsert) target.exec(statement);
          }
        }
        expect(target.prepare("SELECT display_name FROM places").get()?.display_name).toBe(
          "Cafe 'A';\nINSERT INTO user",
        );
        expect(target.prepare("SELECT content FROM area_articles").get()?.content).toBe(
          "First line;\nSecond 'line'",
        );
        expect(target.prepare("SELECT count(*) AS n FROM user").get()?.n).toBe(0);
        target.close();
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
