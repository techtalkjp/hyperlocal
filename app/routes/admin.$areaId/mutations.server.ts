import { createInsertSchema } from 'drizzle-zod'
import { db } from '~/services/db.server'
import { googlePlaces } from '~/services/db/schema'

const insertGooglePlaceSchema = createInsertSchema(googlePlaces)

export const addGooglePlace = async (place: string) => {
  const json = JSON.parse(place)
  const record = insertGooglePlaceSchema.parse({
    id: json.id,
    name: json.name,
    types: json.types,
    primaryType: json.primaryType,
    raiting: json.raiting,
    userRatingCount: json.userRatingCount,
    latitude: json.location.latitude,
    longitude: json.location.longitude,
    displayName: json.displayName.text,
    raw: json,
  })
  return await db.insert(googlePlaces).values(record).returning()
}
