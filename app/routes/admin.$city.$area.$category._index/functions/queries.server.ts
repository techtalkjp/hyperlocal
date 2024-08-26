import { db } from '~/services/db'

export const listAreaGooglePlaces = async (
  areaId: string,
  categoryId: string,
) => {
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
    .where('googlePlacesAreas.categoryId', '==', categoryId)
    .orderBy('googlePlaces.rating desc')
    .orderBy('googlePlaces.userRatingCount desc')

    .execute()
}