import { desc } from 'drizzle-orm'
import { db } from '~/services/db'
import { areas } from '~/services/db/schema'

export const listAreas = async () => {
  return await db.query.areas.findMany({ orderBy: desc(areas.createdAt) })
}
