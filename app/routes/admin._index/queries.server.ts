import { desc } from 'drizzle-orm'
import { areas, db } from '~/services/db'

export const listAreas = async () => {
  return await db.query.areas.findMany({
    orderBy: desc(areas.updatedAt),
  })
}
