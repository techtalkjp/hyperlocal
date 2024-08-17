import { db } from '~/services/db'

export const getArea = async (areaId?: string) => {
  if (areaId === undefined) {
    return null
  }
  return await db
    .selectFrom('areas')
    .selectAll()
    .where('id', '==', areaId)
    .executeTakeFirst()
}

export const listAreaGooglePlaces = async (areaId: string) => {
  return await db
    .selectFrom('googlePlaces')
    .selectAll()
    .innerJoin(
      'googlePlacesAreas',
      'googlePlaces.id',
      'googlePlacesAreas.googlePlaceId',
    )
    .where('googlePlacesAreas.areaId', '==', areaId)
    .orderBy('googlePlaces.rating', 'desc')
    .execute()
}
