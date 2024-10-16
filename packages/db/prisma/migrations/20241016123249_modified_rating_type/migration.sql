/*
  Warnings:

  - You are about to alter the column `user_rating_count` on the `places` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_places" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categories" TEXT NOT NULL DEFAULT '[]',
    "genres" TEXT NOT NULL DEFAULT '[]',
    "display_name" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "user_rating_count" INTEGER NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "google_maps_uri" TEXT NOT NULL,
    "source_uri" TEXT,
    "price_level" TEXT,
    "regular_opening_hours" TEXT,
    "reviews" TEXT NOT NULL,
    "photos" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_places" ("categories", "created_at", "display_name", "genres", "google_maps_uri", "id", "latitude", "longitude", "photos", "price_level", "rating", "regular_opening_hours", "reviews", "source_uri", "updated_at", "user_rating_count") SELECT "categories", "created_at", "display_name", "genres", "google_maps_uri", "id", "latitude", "longitude", "photos", "price_level", "rating", "regular_opening_hours", "reviews", "source_uri", "updated_at", "user_rating_count" FROM "places";
DROP TABLE "places";
ALTER TABLE "new_places" RENAME TO "places";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
