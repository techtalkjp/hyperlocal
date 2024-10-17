import { UTCDate } from '@date-fns/utc'
import { db, type Place } from '@hyperlocal/db'
import { format } from 'date-fns'
import type { translatePlace } from './translate-place'

export const upsertLocalizedPlace = async ({
  cityId,
  areaId,
  categoryId,
  languageId,
  rankingType,
  place,
  translated,
  photos,
}: {
  cityId: string
  areaId: string
  categoryId: string
  languageId: string
  rankingType: string
  place: Place
  translated: Awaited<ReturnType<typeof translatePlace>>
  photos: string[]
}) => {
  const values = {
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
    photos: JSON.stringify(photos ?? []),
    reviews: JSON.stringify(translated.reviews ?? []),
    priceLevel: place.priceLevel,
    rating: place.rating,
    userRatingCount: place.userRatingCount,
    regularOpeningHours: place.regularOpeningHours
      ? JSON.stringify(place.regularOpeningHours)
      : null,
    updatedAt: format(new UTCDate(), 'yyyy-MM-dd HH:mm:ss'),
  }

  return await db
    .insertInto('localizedPlaces')
    .values(values)
    .onConflict((oc) => oc.doUpdateSet(values))
    .returningAll()
    .execute()
}
