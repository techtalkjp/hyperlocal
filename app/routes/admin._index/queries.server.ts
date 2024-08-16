import { desc } from 'drizzle-orm'
import { areas, db } from '~/services/db'

export const listAreas = async () => {
  return await db.select().from(areas).orderBy(desc(areas.createdAt))
}
