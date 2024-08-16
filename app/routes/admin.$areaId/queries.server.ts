import { eq } from 'drizzle-orm'
import { db } from '~/services/db'
import { areas, googlePlacesAreas } from '~/services/db/schema'

export const getArea = async (areaId?: string) => {
  if (areaId === undefined) {
    return null
  }
  return await db.query.areas.findFirst({
    where: eq(areas.id, areaId),
  })
}

export const listAreaGooglePlaces = async (areaId: string) => {
  return await db.query.googlePlaces.findMany({
    with: {
      googlePlacesAreas: {
        where: eq(googlePlacesAreas.areaId, areaId),
      },
    },
  })
}
