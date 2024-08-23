import { db } from '~/services/db'

export const listAreaGooglePlaces = async (areaId: string) => {
  return await db
    .selectFrom('googlePlaces')
    .innerJoin(
      'googlePlacesAreas',
      'googlePlaces.id',
      'googlePlacesAreas.googlePlaceId',
    )
    .selectAll('googlePlaces')
    .select('googlePlacesAreas.categoryId as categoryId')
    .where('googlePlacesAreas.areaId', '==', areaId)
    .orderBy('googlePlaces.rating', 'desc')
    .execute()
}
