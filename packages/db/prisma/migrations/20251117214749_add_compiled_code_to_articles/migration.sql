/*
  Warnings:

  - Added the required column `compiled_code` to the `area_articles` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_area_articles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "city_id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "scene_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "compiled_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "metadata" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_area_articles" ("area_id", "city_id", "content", "created_at", "id", "language", "metadata", "scene_id", "status", "title", "updated_at") SELECT "area_id", "city_id", "content", "created_at", "id", "language", "metadata", "scene_id", "status", "title", "updated_at" FROM "area_articles";
DROP TABLE "area_articles";
ALTER TABLE "new_area_articles" RENAME TO "area_articles";
CREATE UNIQUE INDEX "area_articles_unique" ON "area_articles"("city_id", "area_id", "scene_id", "language");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
