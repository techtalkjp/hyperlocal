import { defineCommand } from 'citty'
import consola from 'consola'
import { sql } from 'kysely'
import { db } from '~/services/duckdb.server'
import { textSearch } from '~/services/google-places-ids'

export default defineCommand({
  meta: {
    name: 'lookup-google-place-ids',
    description:
      'Google Places APIを使ってリスティング用のデータにGoogle Place IDを付与する',
  },
  async run() {
    await lookupGooglePlaceIds()
  },
})

// google places ID をマッピング
export const lookupGooglePlaceIds = async () => {
  const restaurants = await db
    .selectFrom('restaurants')
    .select([
      'name',
      'address',
      () => sql`string_split(address, ' ')[1]`.as('part_address'),
      'url',
    ])
    .where('placeId', 'is', null)
    .execute()

  consola.info(`${restaurants.length} restaurants to lookup`)

  let n = 0
  for (const restaurant of restaurants) {
    const place = await textSearch({
      textQuery: `${restaurant.part_address} ${restaurant.name}`,
    })
    const placeId = place.places?.map((p) => p.id)[0]
    if (placeId === undefined) {
      consola.warn('Not found:', { restaurant, place })
      continue
    }

    await db
      .updateTable('restaurants')
      .set({
        placeId: placeId ?? null,
      })
      .where('url', '==', restaurant.url)
      .execute()

    await db
      .updateTable('ranked_restaurants')
      .set({
        placeId: placeId ?? null,
      })
      .where('url', '==', restaurant.url)
      .execute()

    n++
    if (n % 100 === 0) {
      consola.info(`${n} restaurants updated`)
    }
  }

  consola.info(`Done. ${n} restaurants updated.`)
}
