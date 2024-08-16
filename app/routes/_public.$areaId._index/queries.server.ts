import { desc, eq } from 'drizzle-orm'
import {
  areas,
  db,
  googlePlaces,
  googlePlacesAreas,
  takeFirst,
} from '~/services/db'

export const getArea = async (areaId?: string) => {
  if (areaId === undefined) {
    return null
  }
  const ret = await db.select().from(areas).where(eq(areas.id, areaId)).limit(1)
  return takeFirst(ret)
}

export const listAreaGooglePlaces = async (areaId: string) => {
  const ret = await db
    .select()
    .from(googlePlacesAreas)
    .innerJoin(
      googlePlaces,
      eq(googlePlacesAreas.googlePlaceId, googlePlaces.id),
    )
    .where(eq(googlePlacesAreas.areaId, areaId))
    .orderBy(desc(googlePlaces.rating))

  return ret.map((r) => r.google_places)
}
