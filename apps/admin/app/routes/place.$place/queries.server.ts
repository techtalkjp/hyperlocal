import { db, type Place } from '@hyperlocal/db'

export const getPlace = async (placeId: string): Promise<Place | undefined> => {
  const place = await db
    .selectFrom('places')
    .selectAll()
    .where('places.id', '==', placeId)
    .executeTakeFirst()

  return place as Place | undefined
}
