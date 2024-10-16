import { db } from '@hyperlocal/db'

export const getPlace = async (placeId: string) => {
  return await db
    .selectFrom('places')
    .selectAll()
    .where('id', '==', placeId)
    .executeTakeFirst()
}
