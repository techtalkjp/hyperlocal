import { db } from '@hyperlocal/db'

export const getArticle = async (
  cityId: string,
  areaId: string,
  sceneId: string,
  language: string,
) => {
  const article = await db
    .selectFrom('areaArticles')
    .selectAll()
    .where('cityId', '=', cityId)
    .where('areaId', '=', areaId)
    .where('sceneId', '=', sceneId)
    .where('language', '=', language)
    .where('status', '=', 'published')
    .executeTakeFirst()
  return article
}

export const getPlaceById = async (placeId: string) => {
  const place = await db
    .selectFrom('places')
    .selectAll()
    .where('id', '=', placeId)
    .executeTakeFirst()
  return place
}

export const getOtherArticlesForArea = async (
  cityId: string,
  areaId: string,
  language: string,
  excludeSceneId: string,
) => {
  const articles = await db
    .selectFrom('areaArticles')
    .select(['sceneId', 'title'])
    .where('cityId', '=', cityId)
    .where('areaId', '=', areaId)
    .where('language', '=', language)
    .where('status', '=', 'published')
    .where('sceneId', '!=', excludeSceneId)
    .execute()
  return articles
}
