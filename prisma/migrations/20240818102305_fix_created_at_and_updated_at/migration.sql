-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_areas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "longitude" REAL NOT NULL,
    "latitude" REAL NOT NULL,
    "created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_areas" ("id", "latitude", "longitude", "name") SELECT "id", "latitude", "longitude", "name" FROM "areas";
DROP TABLE "areas";
ALTER TABLE "new_areas" RENAME TO "areas";
CREATE TABLE "new_google_places" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "types" TEXT NOT NULL,
    "primary_type" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "user_rating_count" REAL NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "display_name" TEXT NOT NULL,
    "raw" TEXT NOT NULL,
    "created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_google_places" ("display_name", "id", "latitude", "longitude", "name", "primary_type", "rating", "raw", "types", "user_rating_count") SELECT "display_name", "id", "latitude", "longitude", "name", "primary_type", "rating", "raw", "types", "user_rating_count" FROM "google_places";
DROP TABLE "google_places";
ALTER TABLE "new_google_places" RENAME TO "google_places";
CREATE TABLE "new_google_places_areas" (
    "google_place_id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "google_places_areas_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "google_places_areas_google_place_id_fkey" FOREIGN KEY ("google_place_id") REFERENCES "google_places" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
INSERT INTO "new_google_places_areas" ("area_id", "google_place_id") SELECT "area_id", "google_place_id" FROM "google_places_areas";
DROP TABLE "google_places_areas";
ALTER TABLE "new_google_places_areas" RENAME TO "google_places_areas";
CREATE UNIQUE INDEX "google_places_areas_google_place_id_area_id_unique" ON "google_places_areas"("google_place_id", "area_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
