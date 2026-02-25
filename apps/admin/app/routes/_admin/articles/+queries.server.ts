import { db } from '@hyperlocal/db'

export const listAreaArticles = async () => {
  const articles = await db
    .selectFrom('areaArticles')
    .selectAll()
    .orderBy('updatedAt', 'desc')
    .execute()
  return articles
}
