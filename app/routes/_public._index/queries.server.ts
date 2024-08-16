import { desc } from 'drizzle-orm'
import { db } from '~/services/db'
import { areas } from '~/services/db/schema'

export const listAreas = async () => {
  return await db.select().from(areas).orderBy(desc(areas.createdAt))
}
