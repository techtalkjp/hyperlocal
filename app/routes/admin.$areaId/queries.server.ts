import { eq } from 'drizzle-orm'
import { db, takeFirst } from '~/services/db.server'
import { areas } from '~/services/db/schema'

export const getArea = async (areaId?: string) => {
  if (areaId === undefined) {
    return null
  }
  const ret = await db.select().from(areas).where(eq(areas.id, areaId)).limit(1)
  return takeFirst(ret)
}
