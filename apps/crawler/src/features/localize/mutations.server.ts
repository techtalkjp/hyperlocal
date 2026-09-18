import { UTCDate } from "@date-fns/utc";
import { db, type Place } from "@hyperlocal/db";
import { format } from "date-fns";
import type { translatePlace } from "./translate-place";

export const upsertLocalizedPlace = async ({
  cityId,
  areaId,
  categoryId,
  languageId,
  rankingType,
  place,
  translated,
  sourceHash,
}: {
  cityId: string;
  areaId: string;
  categoryId: string;
  languageId: string;
  rankingType: string;
  place: Place;
  translated: Awaited<ReturnType<typeof translatePlace>>;
  sourceHash: string;
}) => {
  const values = localizedPlaceValues({
    cityId,
    areaId,
    categoryId,
    languageId,
    rankingType,
    place,
    translated,
    sourceHash,
  });

  return await db
    .insertInto("localizedPlaces")
    .values(values)
    .onConflict((oc) => oc.doUpdateSet(values))
    .returningAll()
    .execute();
};

/**
 * 1place×1言語の全掲載キー分を1文でupsert (原子性あり。逐次loopの代替)
 */
export const upsertLocalizedPlaces = async (
  rows: {
    cityId: string;
    areaId: string;
    categoryId: string;
    languageId: string;
    rankingType: string;
    place: Place;
    translated: Awaited<ReturnType<typeof translatePlace>>;
    sourceHash: string;
  }[],
) => {
  if (rows.length === 0) return [];
  const valuesList = rows.map(localizedPlaceValues);
  return await db
    .insertInto("localizedPlaces")
    .values(valuesList)
    .onConflict((oc) =>
      oc.doUpdateSet((eb) => ({
        genres: eb.ref("excluded.genres"),
        displayName: eb.ref("excluded.displayName"),
        originalDisplayName: eb.ref("excluded.originalDisplayName"),
        googleMapsUri: eb.ref("excluded.googleMapsUri"),
        sourceUri: eb.ref("excluded.sourceUri"),
        latitude: eb.ref("excluded.latitude"),
        longitude: eb.ref("excluded.longitude"),
        photos: eb.ref("excluded.photos"),
        reviews: eb.ref("excluded.reviews"),
        priceLevel: eb.ref("excluded.priceLevel"),
        rating: eb.ref("excluded.rating"),
        userRatingCount: eb.ref("excluded.userRatingCount"),
        regularOpeningHours: eb.ref("excluded.regularOpeningHours"),
        sourceHash: eb.ref("excluded.sourceHash"),
        updatedAt: eb.ref("excluded.updatedAt"),
      })),
    )
    .returningAll()
    .execute();
};

const localizedPlaceValues = ({
  cityId,
  areaId,
  categoryId,
  languageId,
  rankingType,
  place,
  translated,
  sourceHash,
}: {
  cityId: string;
  areaId: string;
  categoryId: string;
  languageId: string;
  rankingType: string;
  place: Place;
  translated: Awaited<ReturnType<typeof translatePlace>>;
  sourceHash: string;
}) => {
  return {
    cityId,
    areaId,
    categoryId,
    placeId: place.id,
    language: languageId,
    rankingType,
    genres: JSON.stringify(place.genres),
    displayName: translated.displayName,
    originalDisplayName: translated.originalDisplayName,
    googleMapsUri: place.googleMapsUri,
    sourceUri: place.sourceUri,
    latitude: place.latitude,
    longitude: place.longitude,
    photos: JSON.stringify(place.photos),
    reviews: JSON.stringify(translated.reviews ?? []),
    priceLevel: place.priceLevel,
    rating: place.rating,
    userRatingCount: place.userRatingCount,
    regularOpeningHours: place.regularOpeningHours
      ? JSON.stringify(place.regularOpeningHours)
      : null,
    sourceHash,
    updatedAt: format(new UTCDate(), "yyyy-MM-dd HH:mm:ss"),
  };
};
