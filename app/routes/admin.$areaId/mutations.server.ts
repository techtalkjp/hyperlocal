import { db } from '~/services/db'

export const addGooglePlace = async (areaId: string, placeStr: string) => {
  const json = JSON.parse(placeStr)

  return await db.transaction().execute(async (tsx) => {
    const inserted = await tsx
      .insertInto('googlePlaces')
      .values({
        id: json.id,
        name: json.name,
        types: json.types,
        primaryType: json.primaryType,
        rating: json.rating ?? 0,
        userRatingCount: json.userRatingCount ?? 0,
        latitude: json.location.latitude,
        longitude: json.location.longitude,
        displayName: json.displayName.text,
        raw: placeStr,
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          name: json.name,
          types: json.types,
          primaryType: json.primaryType,
          rating: json.rating ?? 0,
          userRatingCount: json.userRatingCount ?? 0,
          latitude: json.location.latitude,
          longitude: json.location.longitude,
          displayName: json.displayName.text,
          raw: placeStr,
        }),
      )
      .returningAll()
      .executeTakeFirstOrThrow()

    await tsx
      .insertInto('googlePlacesAreas')
      .values({
        googlePlaceId: inserted.id,
        areaId,
      })
      .onConflict((oc) => oc.columns(['googlePlaceId', 'areaId']).doNothing())
      .execute()

    return inserted
  })
}
