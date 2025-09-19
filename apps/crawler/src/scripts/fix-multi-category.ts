import { languages } from '@hyperlocal/consts'
import { db } from '@hyperlocal/db'
import consola from 'consola'
import { db as duckdb } from '~/services/duckdb.server'

/**
 * localizedPlaces に存在しないカテゴリがある場合は、localizedPlaces に追加する
 */
export const fixMultiCategories = async () => {
  const allPlaces = await duckdb
    .selectFrom('ranked_restaurants')
    .select(['placeId', 'area', 'category', 'ranking_type'])
    .execute()

  let processed = 0
  for (const place of allPlaces) {
    for (const lang of languages) {
      // 言語ごとの翻訳データを取得
      const translated = await db
        .selectFrom('localizedPlaces')
        .selectAll()
        .where('placeId', '==', place.placeId)
        .where('language', '==', lang.id)
        .executeTakeFirst()
      if (!translated) {
        consola.error('not found translated', place)
        continue
      }

      for (const rankingType of ['rating', 'review']) {
        const test = await db
          .selectFrom('localizedPlaces')
          .select('placeId')
          .where('cityId', '==', 'tokyo')
          .where('areaId', '==', place.area)
          .where('categoryId', '==', place.category)
          .where('rankingType', '==', rankingType)
          .where('language', '==', lang.id)
          .executeTakeFirst()
        if (!test) {
          // 存在しない場合は翻訳データを元に追加
          const inserted = await db
            .insertInto('localizedPlaces')
            .values({
              ...translated,
              areaId: place.area,
              categoryId: place.category,
              rankingType: rankingType,
              language: lang.id,
            })
            .returningAll()
            .execute()

          consola.info('inserted:', inserted)
          return
        }
      }
    }
    processed++
    consola.info(`processed: ${processed}/${allPlaces.length}`)
  }
}

const test = async () => {
  const place = await duckdb
    .selectFrom('ranked_restaurants')
    .select(['placeId', 'area', 'category', 'ranking_type'])
    .where('placeId', '==', 'ChIJvcRQHESLGGARSZaZn_rHFFI')
    .execute()

  consola.debug(place)
  if (!place) {
    return
  }
}
//await fixMultiCategories()
await test()
