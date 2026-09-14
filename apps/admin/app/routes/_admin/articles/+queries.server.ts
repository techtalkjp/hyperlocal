import { getDb } from '~/lib/db'
import type { AdminEnv } from '~/lib/request-context'

export const listAreaArticles = async (env: AdminEnv) => {
  const articles = await getDb(env)
    .selectFrom('areaArticles')
    .selectAll()
    .orderBy('updatedAt', 'desc')
    .execute()
  return articles
}
