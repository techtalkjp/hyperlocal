import { db } from '~/services/duckdb.server'

export const stats = async () => {
  const restaurants = await db
    .selectFrom('crawled_restaurants')
    .selectAll()
    .where('reviewCount', '>=', 3)
    .orderBy('reviewCount', 'desc')
    .execute()

  console.log(restaurants)
}
