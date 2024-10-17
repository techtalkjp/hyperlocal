/*
  Warnings:

  - You are about to drop the `google_places` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `google_places_areas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "google_places";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "google_places_areas";
PRAGMA foreign_keys=on;
