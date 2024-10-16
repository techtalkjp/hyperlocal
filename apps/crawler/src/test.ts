import { UTCDate } from '@date-fns/utc'
import { format } from 'date-fns'
import { db } from '~/services/duckdb.server'

export const main = async () => {
  const restaurant = await db
    .selectFrom('restaurants')
    .selectAll()
    .limit(1)
    .executeTakeFirstOrThrow()
  console.log({ restaurant, now: format(new UTCDate(), 'yyyy-MM-dd HH:mm:ss') })
}

main()
