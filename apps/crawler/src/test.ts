import { db } from '~/services/duckdb.server'

export const main = async () => {
  const restaurant = await db
    .selectFrom('restaurants')
    .selectAll()
    .limit(1)
    .executeTakeFirstOrThrow()
  console.log({ restaurant })
}

main()
