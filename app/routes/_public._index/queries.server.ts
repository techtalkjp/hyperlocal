import { db } from '~/services/db'

export const listAreas = async (cityId?: string) => {
  const query = db.selectFrom('areas').selectAll()
  if (cityId) {
    query.where('cityId', '==', cityId)
  }
  return await query.orderBy('createdAt', 'desc').execute()
}
