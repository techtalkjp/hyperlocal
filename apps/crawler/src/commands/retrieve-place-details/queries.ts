import { db } from '@hyperlocal/db'

export const getPlace = async (placeId: string) => {
  return await db
    .selectFrom('places')
    .selectAll()
    .where((eb) =>
      eb.or([
        eb('id', '==', placeId),
        eb('googlePlaceId', '==', placeId),
      ]),
    )
    .executeTakeFirst()
}
