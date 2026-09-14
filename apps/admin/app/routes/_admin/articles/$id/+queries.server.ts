import { getDb } from '~/lib/db'
import type { AdminEnv } from '~/lib/request-context'

export const getArticle = async (env: AdminEnv, id: string) => {
  const article = await getDb(env)
    .selectFrom('areaArticles')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()
  return article
}

export const updateArticle = async (
  env: AdminEnv,
  id: string,
  data: {
    title: string
    content: string
    metadata: string
    status: string
  },
) => {
  const article = await getDb(env)
    .updateTable('areaArticles')
    .set({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow()
  return article
}

export const deleteArticle = async (env: AdminEnv, id: string) => {
  await getDb(env).deleteFrom('areaArticles').where('id', '=', id).execute()
}
