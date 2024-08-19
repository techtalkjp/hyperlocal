import { db } from '~/services/db'

export const getArea = async (areaId?: string) => {
  if (areaId === undefined) {
    return null
  }
  return await db
    .selectFrom('areas')
    .selectAll()
    .where('id', '==', areaId)
    .executeTakeFirst()
}
