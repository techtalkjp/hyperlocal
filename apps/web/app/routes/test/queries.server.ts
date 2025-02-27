import { db, sql, type LocalizedPlace } from '@hyperlocal/db'

export const listPlaces = async () => {
  const places = await db
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
    .where('language', '=', 'ja')
    .limit(5)
    .execute()
  return places as unknown as LocalizedPlace[]
}
