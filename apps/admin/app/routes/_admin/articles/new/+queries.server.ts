import { createId } from '@paralleldrive/cuid2'
import { purgeWebCache } from '~/lib/cache-purge.server'
import { getDb } from '~/lib/db'
import type { AdminEnv } from '~/lib/request-context'
import { compileMDX } from '~/services/mdx.server'

export const createArticle = async (
  env: AdminEnv,
  data: {
    cityId: string
    areaId: string
    sceneId: string
    language: string
    title: string
    content: string
    metadata: string
    status: string
  },
) => {
  // Compile MDX
  const compiledCode = await compileMDX(data.content)

  const article = await getDb(env)
    .insertInto('areaArticles')
    .values({
      id: createId(),
      ...data,
      compiledCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow()
  await purgeWebCache(env, ['guide'])
  return article
}

export const getPlacesForArea = async (
  env: AdminEnv,
  areaId: string,
  categoryId: string,
  rankingType: 'rating' | 'review',
) => {
  const places = await getDb(env)
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
