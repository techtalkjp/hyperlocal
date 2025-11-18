-- CreateIndex
CREATE INDEX IF NOT EXISTS "localized_places_place_id_language_idx" ON "localized_places"("place_id", "language");
