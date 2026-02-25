import { db } from '@hyperlocal/db'

export const getArticle = async (id: string) => {
  const article = await db
    .selectFrom('areaArticles')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()
  return article
}

export const updateArticle = async (
  id: string,
  data: {
    title: string
    content: string
    metadata: string
    status: string
  },
) => {
  const article = await db
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

export const deleteArticle = async (id: string) => {
  await db.deleteFrom('areaArticles').where('id', '=', id).execute()
}
