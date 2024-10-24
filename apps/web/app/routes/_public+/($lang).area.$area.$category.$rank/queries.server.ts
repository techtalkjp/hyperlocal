import { db, type LocalizedPlace } from '@hyperlocal/db'

export const listLocalizedPlaces = async ({
  cityId,
  areaId,
  categoryId,
  language,
  rankingType = 'rating',
}: {
  cityId: string
  areaId: string
  categoryId: string
  language: string
  rankingType: 'review' | 'rating'
}) => {
  let query = db
    .selectFrom('localizedPlaces')
    .select([
      'cityId',
      'areaId',
      'categoryId',
      'placeId',
      'language',
      'genres',
      'displayName',
      'originalDisplayName',
      'rating',
      'userRatingCount',
      'latitude',
      'longitude',
      'googleMapsUri',
      'sourceUri',
      'priceLevel',
      'regularOpeningHours',
      'reviews',
      'photos',
    ])
    .distinct()
    .where('cityId', '==', cityId)
    .where('localizedPlaces.areaId', '==', areaId)
    .where('localizedPlaces.categoryId', '==', categoryId)
    .where('localizedPlaces.language', '==', language)
    .where('localizedPlaces.rating', '>', 0)
    .limit(100)

  if (rankingType === 'rating') {
    query = query.orderBy(['rating desc', 'userRatingCount desc'])
  }
  if (rankingType === 'review') {
    query = query.orderBy(['userRatingCount desc', 'rating desc'])
  }

  return (await query.execute()) as unknown as LocalizedPlace[]
}
