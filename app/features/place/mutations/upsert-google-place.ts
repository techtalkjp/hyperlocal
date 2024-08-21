import dayjs from '~/libs/dayjs'
import { db } from '~/services/db'
import type { Place } from '~/services/google-places'

export const upsertGooglePlace = async (
  areaId: string,
  categoryId: string,
  place: Place,
) => {
  return await db.transaction().execute(async (tsx) => {
    const inserted = await tsx
      .insertInto('googlePlaces')
      .values({
        id: place.id,
        name: place.name,
        types: JSON.stringify(place.types),
        primaryType: place.primaryType,
        rating: place.rating ?? 0,
        userRatingCount: place.userRatingCount ?? 0,
        latitude: place.location.latitude,
        longitude: place.location.longitude,
        displayName: place.displayName.text,
        raw: JSON.stringify(place),
        updatedAt: dayjs().utc().format('YYYY-MM-DD HH:mm:ss'),
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          name: place.name,
          types: JSON.stringify(place.types),
          primaryType: place.primaryType,
          rating: place.rating ?? 0,
          userRatingCount: place.userRatingCount ?? 0,
          latitude: place.location.latitude,
          longitude: place.location.longitude,
          displayName: place.displayName.text,
          raw: JSON.stringify(place),
          updatedAt: dayjs().utc().format('YYYY-MM-DD HH:mm:ss'),
        }),
      )
      .returningAll()
      .executeTakeFirstOrThrow()

    await tsx
      .insertInto('googlePlacesAreas')
      .values({
        googlePlaceId: inserted.id,
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
