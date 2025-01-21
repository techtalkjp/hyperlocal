import { db, sql, type LocalizedPlace } from '@hyperlocal/db'

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
      () =>
        sql`
          JSON_ARRAY
          (
            JSON_SET(
              JSON_EXTRACT(reviews, '$[0]'),
              '$.text',
              SUBSTRING(
                JSON_EXTRACT(reviews, '$[0].text'),
                1,
                350
              )
            )
          )`.as('reviews'), // 最初のレビューを取得し、内容を350文字に制限
      () => sql`JSON_ARRAY(JSON_EXTRACT(photos, '$[0]'))`.as('photos'), // 最初の写真だけ取得
    ])
    .distinct()
    .where('cityId', '==', cityId)
    .where('localizedPlaces.areaId', '==', areaId)
    .where('localizedPlaces.categoryId', '==', categoryId)
    .where('localizedPlaces.rankingType', '==', rankingType)
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
