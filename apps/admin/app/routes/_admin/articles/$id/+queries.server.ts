import { purgeWebCache } from '~/lib/cache-purge.server'
import { getDb } from '~/lib/db'
import type { AdminEnv } from '~/lib/request-context'
import { compileMDX } from '~/services/mdx.server'

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
  // Recompile MDX so the public page reflects the edited content
  const compiledCode = await compileMDX(data.content)

  const article = await getDb(env)
    .updateTable('areaArticles')
    .set({
      ...data,
      compiledCode,
      updatedAt: new Date().toISOString(),
    })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow()
  await purgeWebCache(env, ['guide'])
  return article
}

export const deleteArticle = async (env: AdminEnv, id: string) => {
  await getDb(env).deleteFrom('areaArticles').where('id', '=', id).execute()
  await purgeWebCache(env, ['guide'])
}
