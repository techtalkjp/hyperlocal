import { describe, expect, it } from "vite-plus/test";
import { DatabaseSync } from "node:sqlite";
import { splitExportSql } from "./split-export-sql";

describe("splitExportSql", () => {
  it("keeps SQL-like article text within its INSERT", () => {
    const source = `INSERT INTO "area_articles" ("content") VALUES ('Intro;\nINSERT INTO "user" VALUES (''fake'');\nEnd');\nINSERT INTO "places" ("name") VALUES ('Cafe');\n`;
    expect(splitExportSql(source)).toEqual([
      `INSERT INTO "area_articles" ("content") VALUES ('Intro;\nINSERT INTO "user" VALUES (''fake'');\nEnd');`,
      `INSERT INTO "places" ("name") VALUES ('Cafe');`,
    ]);
  });

  it("rejects incomplete or unexpected statements", () => {
    expect(() => splitExportSql(`INSERT INTO "places" VALUES ('unfinished`)).toThrow();
    expect(() => splitExportSql(`DELETE FROM "places";`)).toThrow();
    expect(() => splitExportSql(`INSERT INTO "user" VALUES ('secret');`, "places")).toThrow();
  });

  it("applies synthetic article and restaurant rows with quotes and newlines", () => {
    const database = new DatabaseSync(":memory:");
    try {
      database.exec('CREATE TABLE "places" ("name" TEXT);');
      database.exec('CREATE TABLE "area_articles" ("content" TEXT);');
      const place = `INSERT INTO "places" ("name") VALUES ('Cafe ''A'';\nINSERT INTO "user"');`;
      const article = `INSERT INTO "area_articles" ("content") VALUES ('First line;\nSecond ''line''');`;
      for (const statement of splitExportSql(place, "places")) database.exec(statement);
      for (const statement of splitExportSql(article, "area_articles")) database.exec(statement);
      expect(database.prepare('SELECT name FROM "places"').get()?.name).toBe(
        "Cafe 'A';\nINSERT INTO \"user\"",
      );
      expect(database.prepare('SELECT content FROM "area_articles"').get()?.content).toBe(
        "First line;\nSecond 'line'",
      );
    } finally {
      database.close();
    }
  });
});
