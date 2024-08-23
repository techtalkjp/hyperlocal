-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "longitude" REAL NOT NULL,
    "latitude" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "google_places" (
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "google_places_areas" (
    "google_place_id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "google_places_areas_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "google_places_areas_google_place_id_fkey" FOREIGN KEY ("google_place_id") REFERENCES "google_places" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateIndex
CREATE UNIQUE INDEX "google_place_area_category_unique" ON "google_places_areas"("google_place_id", "area_id", "category_id");
