import { sql } from 'kysely'
import { db } from '~/services/duckdb.server'
import { textSearch } from '~/services/google-places-ids'

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

  for (const restaurant of restaurants) {
    const place = await textSearch({
      textQuery: `${restaurant.part_address} ${restaurant.name}`,
    })
    const placeId = place.places?.map((p) => p.id)[0]
    if (placeId === undefined) {
      console.log('Not found:', { restaurant, place })
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
  }
}
