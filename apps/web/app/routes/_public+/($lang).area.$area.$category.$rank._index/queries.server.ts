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
    .selectAll()
    .where('cityId', '==', cityId)
    .where('localizedPlaces.areaId', '==', areaId)
    .where('localizedPlaces.categoryId', '==', categoryId)
    .where('localizedPlaces.language', '==', language)
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
