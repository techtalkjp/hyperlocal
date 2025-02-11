import { db } from '@hyperlocal/db'
import consola from 'consola'
import { db as duckdb } from '~/services/duckdb.server'

/**
 * duckdb 上のランキングに存在しない場所を削除する
 */
export const cleanup = async () => {
  const allPlaces = await db.selectFrom('places').select('places.id').execute()
  consola.info(allPlaces.length)

  let processed = 0
  let n = 0
  for (const place of allPlaces) {
    const ranked = await duckdb
      .selectFrom('ranked_restaurants')
      .select('placeId')
      .distinct()
      .where('placeId', '==', place.id)
      .executeTakeFirst()
    if (!ranked) {
      n++
      await db
        .deleteFrom('placeListings')
        .where('placeId', '==', place.id)
        .execute()
      await db
        .deleteFrom('localizedPlaces')
        .where('placeId', '==', place.id)
        .execute()
      await db.deleteFrom('places').where('id', '==', place.id).execute()
      consola.info(`deleted place: ${n}/${processed}`, place.id)
    }
    processed++
  }
}

cleanup()
