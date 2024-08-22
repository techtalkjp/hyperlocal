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
