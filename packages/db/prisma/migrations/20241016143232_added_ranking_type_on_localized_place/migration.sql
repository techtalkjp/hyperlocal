/*
  Warnings:

  - The primary key for the `localized_places` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `ranking_type` to the `localized_places` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_localized_places" (
    "city_id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "ranking_type" TEXT NOT NULL,
    "place_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "genres" TEXT NOT NULL DEFAULT '[]',
    "display_name" TEXT NOT NULL,
    "original_display_name" TEXT NOT NULL,
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
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("city_id", "area_id", "category_id", "ranking_type", "place_id", "language"),
    CONSTRAINT "localized_places_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_localized_places" ("area_id", "category_id", "city_id", "created_at", "display_name", "genres", "google_maps_uri", "language", "latitude", "longitude", "original_display_name", "photos", "place_id", "price_level", "rating", "regular_opening_hours", "reviews", "source_uri", "updated_at", "user_rating_count") SELECT "area_id", "category_id", "city_id", "created_at", "display_name", "genres", "google_maps_uri", "language", "latitude", "longitude", "original_display_name", "photos", "place_id", "price_level", "rating", "regular_opening_hours", "reviews", "source_uri", "updated_at", "user_rating_count" FROM "localized_places";
DROP TABLE "localized_places";
ALTER TABLE "new_localized_places" RENAME TO "localized_places";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
