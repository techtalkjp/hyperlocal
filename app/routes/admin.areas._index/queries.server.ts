import { db } from '~/services/db'

export const listAllAreas = async () => {
  return await db
    .selectFrom('areas')
    .selectAll()
    .orderBy('createdAt', 'desc')
    .execute()
}
