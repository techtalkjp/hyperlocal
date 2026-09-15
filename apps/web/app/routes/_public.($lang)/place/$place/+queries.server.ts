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

export const getPlaceListings = async ({ placeId }: { placeId: string }) => {
  const listings = await db
    .selectFrom('placeListings')
    .select(['areaId', 'categoryId'])
    .where('placeId', '==', placeId)
    .execute()

  return listings
}

// 旧Google Place ID -> 自社IDの解決 (移行期のリダイレクト用)
// 移行前DB (google_place_id列なし) ではnullを返す
export const getPlaceIdByGoogleId = async ({
  googlePlaceId,
}: {
  googlePlaceId: string
}): Promise<string | null> => {
  try {
    const row = await db
      .selectFrom('places')
      .select('id')
      .where('googlePlaceId', '==', googlePlaceId)
      .executeTakeFirst()
    return row?.id ?? null
  } catch {
    return null
  }
}
