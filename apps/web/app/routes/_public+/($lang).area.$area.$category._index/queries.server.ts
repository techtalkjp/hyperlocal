import { db, type LocalizedPlace } from '@hyperlocal/db'

export const listLocalizedPlaces = async (
  cityId: string,
  areaId: string,
  categoryId: string,
  lang: string,
  rankingType: 'review' | 'rating' = 'rating',
) => {
  let query = db
    .selectFrom('localizedPlaces')
    .selectAll()
    .where('cityId', '==', cityId)
    .where('localizedPlaces.areaId', '==', areaId)
    .where('localizedPlaces.categoryId', '==', categoryId)
    .where('localizedPlaces.language', '==', lang)
    .where('localizedPlaces.rankingType', '==', rankingType)
    .where('localizedPlaces.rating', '>', 0)
    .limit(100)

  if (rankingType === 'review') {
    query = query.orderBy(['userRatingCount desc', 'rating desc'])
  }
  if (rankingType === 'rating') {
    query = query.orderBy(['rating desc', 'userRatingCount desc'])
  }

  return (await query.execute()) as unknown as LocalizedPlace[]
}
