/*
  Warnings:

  - You are about to drop the column `description` on the `localized_places` table. All the data in the column will be lost.
  - Added the required column `original_display_name` to the `localized_places` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_localized_places" (
    "city_id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "place_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "types" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "original_display_name" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "user_rating_count" INTEGER NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "google_maps_uri" TEXT NOT NULL,
    "price_level" TEXT,
    "regular_opening_hours" TEXT,
    "reviews" TEXT NOT NULL,
    "photos" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("city_id", "language", "area_id", "category_id", "place_id"),
    CONSTRAINT "localized_places_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "google_places" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_localized_places" ("area_id", "category_id", "city_id", "created_at", "display_name", "google_maps_uri", "language", "latitude", "longitude", "photos", "place_id", "price_level", "rating", "regular_opening_hours", "reviews", "types", "updated_at", "user_rating_count") SELECT "area_id", "category_id", "city_id", "created_at", "display_name", "google_maps_uri", "language", "latitude", "longitude", "photos", "place_id", "price_level", "rating", "regular_opening_hours", "reviews", "types", "updated_at", "user_rating_count" FROM "localized_places";
DROP TABLE "localized_places";
ALTER TABLE "new_localized_places" RENAME TO "localized_places";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
