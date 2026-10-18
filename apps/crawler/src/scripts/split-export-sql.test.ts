import { describe, expect, it } from "vite-plus/test";
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
  });
});
