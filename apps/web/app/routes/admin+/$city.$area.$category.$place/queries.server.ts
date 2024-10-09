import { db, type GooglePlace } from '@hyperlocal/db'

export const getAreaGooglePlace = async (placeId: string) => {
  return (await db
    .selectFrom('googlePlaces')
    .selectAll()
    .where('googlePlaces.id', '==', placeId)
    .executeTakeFirst()) as unknown as GooglePlace | undefined
}
