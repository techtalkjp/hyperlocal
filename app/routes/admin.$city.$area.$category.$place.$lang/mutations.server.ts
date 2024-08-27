import dayjs from '~/libs/dayjs'
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
  const values = {
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
    photos: JSON.stringify(photos ?? []),
    reviews: JSON.stringify(translated.reviews ?? []),
    priceLevel: googlePlace.priceLevel,
    rating: googlePlace.rating,
    types: JSON.stringify(googlePlace.types),
    userRatingCount: googlePlace.userRatingCount,
    regularOpeningHours: googlePlace.regularOpeningHours
      ? JSON.stringify(googlePlace.regularOpeningHours)
      : null,
    updatedAt: dayjs().utc().format('YYYY-MM-DD HH:mm:ss'),
  }

  console.log({ values })

  return await db
    .insertInto('localizedPlaces')
    .values(values)
    .onConflict((oc) => oc.doUpdateSet(values))
    .execute()
}
