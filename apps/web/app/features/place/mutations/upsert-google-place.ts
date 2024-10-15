import { db } from '@hyperlocal/db'
import type { Place } from '@hyperlocal/types'
import dayjs from '~/libs/dayjs'

export const upsertGooglePlace = async (
  cityId: string,
  areaId: string,
  categoryId: string,
  place: Place,
) => {
  return await db.transaction().execute(async (tsx) => {
    const googlePlaceRecord = {
      id: place.id,
      types: JSON.stringify(place.types),
      displayName: place.displayName.text,
      rating: place.rating ?? 0,
      userRatingCount: place.userRatingCount ?? 0,
      latitude: place.location.latitude,
      longitude: place.location.longitude,
      googleMapsUri: place.googleMapsUri,
      priceLevel: place.priceLevel,
      regularOpeningHours: JSON.stringify(place.regularOpeningHours),
      reviews: JSON.stringify(place.reviews ?? []),
      photos: JSON.stringify(place.photos ?? []),
      raw: JSON.stringify(place),
      updatedAt: dayjs().utc().format('YYYY-MM-DD HH:mm:ss'),
    }
    const inserted = await tsx
      .insertInto('googlePlaces')
      .values(googlePlaceRecord)
      .onConflict((oc) => oc.column('id').doUpdateSet(googlePlaceRecord))
      .returningAll()
      .executeTakeFirstOrThrow()

    await tsx
      .insertInto('googlePlacesAreas')
      .values({
        googlePlaceId: inserted.id,
        cityId,
        areaId,
        categoryId,
        updatedAt: dayjs().utc().format('YYYY-MM-DD HH:mm:ss'),
      })
      .onConflict((oc) =>
        oc.columns(['googlePlaceId', 'areaId', 'categoryId']).doNothing(),
      )
      .execute()

    return inserted
  })
}
