import { db } from '@hyperlocal/db'

export const getPublishedArticlesForArea = async (
  cityId: string,
  areaId: string,
  language: string,
) => {
  const articles = await db
    .selectFrom('areaArticles')
    .select(['sceneId', 'title'])
    .where('cityId', '=', cityId)
    .where('areaId', '=', areaId)
    .where('language', '=', language)
    .where('status', '=', 'published')
    .execute()
  return articles
}
