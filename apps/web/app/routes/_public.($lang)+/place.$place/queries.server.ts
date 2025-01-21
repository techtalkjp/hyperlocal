import { db, type LocalizedPlace } from '@hyperlocal/db'

export const getLocalizedPlace = async ({
  placeId,
  language,
}: {
  placeId: LocalizedPlace['placeId']
  language: LocalizedPlace['language']
}) => {
  const place = await db
    .selectFrom('localizedPlaces')
    .selectAll()
    .where('placeId', '==', placeId)
    .where('language', '==', language)
    .limit(1)
    .executeTakeFirst()

  return place as unknown as LocalizedPlace
}
