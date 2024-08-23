import { db } from '~/services/db'

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
