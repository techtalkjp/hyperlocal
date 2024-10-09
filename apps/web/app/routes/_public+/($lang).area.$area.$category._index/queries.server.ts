import { db, type LocalizedPlace } from '@hyperlocal/db'

export const listLocalizedPlaces = async (
  cityId: string,
  areaId: string,
  categoryId: string,
  lang: string,
) => {
  return (await db
    .selectFrom('localizedPlaces')
    .selectAll()
    .where('cityId', '==', cityId)
    .where('localizedPlaces.areaId', '==', areaId)
    .where('localizedPlaces.categoryId', '==', categoryId)
    .where('localizedPlaces.language', '==', lang)
    .where('localizedPlaces.rating', '>', 0)
    .orderBy([
      'localizedPlaces.rating desc',
      'localizedPlaces.userRatingCount desc',
    ])
    .limit(100)
    .execute()) as unknown as LocalizedPlace[]
}
