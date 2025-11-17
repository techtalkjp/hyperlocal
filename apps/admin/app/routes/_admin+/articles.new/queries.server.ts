import { db } from '@hyperlocal/db'
import { createId } from '@paralleldrive/cuid2'

export const createArticle = async (data: {
  cityId: string
  areaId: string
  sceneId: string
  language: string
  title: string
  content: string
  metadata: string
  status: string
}) => {
  const article = await db
    .insertInto('areaArticles')
    .values({
      id: createId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow()
  return article
}

export const getPlacesForArea = async (
  areaId: string,
  categoryId: string,
  rankingType: 'rating' | 'review',
) => {
  const places = await db
    .selectFrom('places')
    .innerJoin('placeListings', 'places.id', 'placeListings.placeId')
    .selectAll('places')
    .where('placeListings.areaId', '=', areaId)
    .where('placeListings.categoryId', '=', categoryId)
    .where('placeListings.rankingType', '=', rankingType)
    .orderBy('places.rating', 'desc')
    .orderBy('places.userRatingCount', 'desc')
    .limit(10)
    .execute()
  return places
}
