import { db } from '~/services/db'

export const listAreas = async () => {
  return await db
    .selectFrom('areas')
    .selectAll()
    .orderBy('updatedAt', 'desc')
    .execute()
}
