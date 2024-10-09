-- CreateTable
CREATE TABLE "google_places" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "types" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "user_rating_count" REAL NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "google_maps_uri" TEXT NOT NULL,
    "price_level" TEXT,
    "regular_opening_hours" TEXT,
    "reviews" TEXT NOT NULL,
    "photos" TEXT NOT NULL,
    "raw" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "google_places_areas" (
    "google_place_id" TEXT NOT NULL,
    "city_id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "google_places_areas_google_place_id_fkey" FOREIGN KEY ("google_place_id") REFERENCES "google_places" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "localized_places" (
    "city_id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "place_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "types" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "user_rating_count" INTEGER NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "google_maps_uri" TEXT NOT NULL,
    "price_level" TEXT NOT NULL,
    "regular_opening_hours" TEXT NOT NULL,
    "reviews" TEXT NOT NULL,
    "photos" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("city_id", "language", "area_id", "category_id", "place_id"),
    CONSTRAINT "localized_places_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "google_places" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "google_place_area_category_unique" ON "google_places_areas"("google_place_id", "area_id", "category_id");
