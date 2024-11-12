import { db, type Place } from '@hyperlocal/db'

export const getPlace = async (placeId: string): Promise<Place | undefined> => {
  const place = await db
    .selectFrom('places')
    .selectAll()
    .where('places.id', '==', placeId)
    .executeTakeFirst()

  return place as Place | undefined
}

export const getLocalizedPlace = async (placeId: string, lang: string) => {
  return await db
    .selectFrom('localizedPlaces')
    .distinct()
    .selectAll()
    .where('placeId', '==', placeId)
    .where('language', '==', lang)
    .executeTakeFirst()
}
