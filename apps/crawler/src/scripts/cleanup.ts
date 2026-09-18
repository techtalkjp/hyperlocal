import { db } from '@hyperlocal/db'
import consola from 'consola'
import { db as duckdb } from '~/services/duckdb.server'

/**
 * duckdb 上のランキングに存在しない場所を削除する
 * 突合キーはTabelog URL (places.sourceUri <-> ranked_restaurants.url)
 */
export const cleanup = async () => {
  const allPlaces = await db
    .selectFrom('places')
    .select(['places.id', 'places.sourceUri'])
    .execute()
  consola.info(allPlaces.length)

  const ranked = await duckdb
    .selectFrom('ranked_restaurants')
    .select('url')
    .distinct()
    .execute()
  const liveUrls = new Set(ranked.map((r) => r.url))

  let n = 0
  for (const place of allPlaces) {
    if (place.sourceUri && liveUrls.has(place.sourceUri)) {
      continue
    }
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
    consola.info(`deleted place: ${n}`, place.id)
  }
}

cleanup()
