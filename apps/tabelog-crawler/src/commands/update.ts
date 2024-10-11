import { kysely } from '~/services/duckdb.server'

export const update = async () => {
  const restaurants = await kysely
    .selectFrom('restaurants')
    .selectAll()
    .orderBy('reviewCount desc')
    .limit(10)
    .execute()

  for (const restaurant of restaurants) {
    const { features, ...rest } = restaurant
    console.log({
      ...rest,
      genre: features.ジャンル.split('、'),
    })
  }
}
