import { eq } from 'drizzle-orm'
import { areas, db, googlePlacesAreas } from '~/services/db'

export const getArea = async (areaId?: string) => {
  if (areaId === undefined) {
    return null
  }
  return await db.query.areas.findFirst({
    where: eq(areas.id, areaId),
  })
}

export const listAreaGooglePlaces = async (areaId: string) => {
  const ret = await db.query.googlePlaces.findMany({
    with: {
      googlePlacesAreas: {
        where: eq(googlePlacesAreas.areaId, areaId),
      },
    },
  })

  return ret
}
