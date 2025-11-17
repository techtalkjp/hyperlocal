import { UTCDate } from '@date-fns/utc'
import { db, sql } from '@hyperlocal/db'
import { format, isAfter } from 'date-fns'

export const generateArticlesSitemap = async (
  origin: string,
  cityId: string,
  langId: string,
) => {
  const urls = []
  const now = format(new UTCDate(), "yyyy-MM-dd'T'HH:mm:ssXXX")

  // Get all published articles for this city and language
  const articles = await db
    .selectFrom('areaArticles')
    .select([
      'areaId',
      'sceneId',
      sql<string>`strftime('%Y-%m-%dT%H:%M:%SZ', updated_at)`.as('lastmod'),
    ])
    .where('cityId', '=', cityId)
    .where('language', '=', langId)
    .where('status', '=', 'published')
    .execute()

  for (const article of articles) {
    urls.push({
      loc: `${origin}/${langId === 'en' ? '' : `${langId}/`}area/${article.areaId}/guide/${article.sceneId}`,
      lastmod: article.lastmod,
      priority: 0.7,
    })
  }

  if (urls.length === 0) {
    return '' // Return empty if no articles
  }

  const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => {
    const lastmod = isAfter(now, new UTCDate(url.lastmod))
      ? format(now, "yyyy-MM-dd'T'HH:mm:ssXXX")
      : url.lastmod

    return `<url>
  <loc>${url.loc}</loc>
  <lastmod>${lastmod}</lastmod>
  <priority>${url.priority}</priority>
</url>
`
  })
  .join('')}</urlset>`

  return sitemap
}
