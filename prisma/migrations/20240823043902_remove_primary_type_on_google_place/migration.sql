/*
  Warnings:

  - You are about to drop the column `primary_type` on the `google_places` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_google_places" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "types" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "user_rating_count" REAL NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "display_name" TEXT NOT NULL,
    "raw" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_google_places" ("created_at", "display_name", "id", "latitude", "longitude", "name", "rating", "raw", "types", "updated_at", "user_rating_count") SELECT "created_at", "display_name", "id", "latitude", "longitude", "name", "rating", "raw", "types", "updated_at", "user_rating_count" FROM "google_places";
DROP TABLE "google_places";
ALTER TABLE "new_google_places" RENAME TO "google_places";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
