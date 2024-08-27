import { db, type GooglePlace } from '~/services/db'
import type { translatePlace } from './translate-place'

export const upsertLocalizedPlace = async ({
  cityId,
  areaId,
  categoryId,
  languageId,
  translated,
  googlePlace,
  photos,
}: {
  cityId: string
  areaId: string
  categoryId: string
  languageId: string
  googlePlace: GooglePlace
  translated: Awaited<ReturnType<typeof translatePlace>>
  photos: string[]
}) => {
  await db.insertInto('localizedPlaces').values({
    placeId: googlePlace.id,
    cityId,
    areaId,
    categoryId,
    language: languageId,
    displayName: translated.displayName,
    originalDisplayName: translated.originalDisplayName,
    googleMapsUri: googlePlace.googleMapsUri,
    latitude: googlePlace.latitude,
    longitude: googlePlace.longitude,
    photos: JSON.stringify(photos),
    reviews: JSON.stringify(translated.reviews),
    priceLevel: googlePlace.priceLevel,
    rating: googlePlace.rating,
    types: googlePlace.types,
    userRatingCount: googlePlace.userRatingCount,
    regularOpeningHours: googlePlace.regularOpeningHours,
  })
}
