import { db } from '~/services/db'

export const listAreaGooglePlaces = async (
  areaId: string,
  categoryId: string,
) => {
  return await db
    .selectFrom('googlePlaces')
    .selectAll()
    .innerJoin(
      'googlePlacesAreas',
      'googlePlaces.id',
      'googlePlacesAreas.googlePlaceId',
    )
    .where('googlePlacesAreas.areaId', '==', areaId)
    .where('googlePlacesAreas.categoryId', '==', categoryId)
    .where('googlePlaces.rating', '>', 0)
    .orderBy(['googlePlaces.rating desc', 'googlePlaces.userRatingCount desc'])
    .limit(100)
    .execute()
}
