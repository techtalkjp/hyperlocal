import { createInsertSchema } from 'drizzle-zod'
import { db, takeFirstOrThrow } from '~/services/db.server'
import { googlePlaces, googlePlacesAreas } from '~/services/db/schema'

const insertGooglePlaceSchema = createInsertSchema(googlePlaces)

export const addGooglePlace = async (areaId: string, place: string) => {
  const json = JSON.parse(place)
  const row = insertGooglePlaceSchema.parse({
    id: json.id,
    name: json.name,
    types: json.types,
    primaryType: json.primaryType,
    rating: json.rating ?? 0,
    userRatingCount: json.userRatingCount ?? 0,
    latitude: json.location.latitude,
    longitude: json.location.longitude,
    displayName: json.displayName.text,
    raw: json,
  })
  const record = takeFirstOrThrow(
    await db
      .insert(googlePlaces)
      .values(row)
      .onConflictDoUpdate({
        target: googlePlaces.id,
        set: row,
      })
      .returning(),
  )
  await db
    .insert(googlePlacesAreas)
    .values({
      areaId,
      googlePlaceId: record.id,
    })
    .onConflictDoNothing({
      target: [googlePlacesAreas.googlePlaceId, googlePlacesAreas.areaId],
    })

  return record
}
