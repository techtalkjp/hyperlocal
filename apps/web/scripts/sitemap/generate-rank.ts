import { UTCDate } from '@date-fns/utc'
import { db, sql } from '@hyperlocal/db'
import { format, isAfter } from 'date-fns'

export const generateRankSitemap = async (
  origin: string,
  cityId: string,
  langId: string,
) => {
  const urls = []

  // rating, review
  const areaCategories = await db
    .selectFrom('localizedPlaces')
    .select([
      'areaId',
      'categoryId',
      'rankingType',
      sql<string>`strftime('%Y-%m-%dT%H:%M:%SZ', updated_at)`.as('lastmod'),
    ])
    .where('cityId', '==', cityId)
    .where('language', '==', langId)
    .groupBy(['areaId', 'categoryId', 'rankingType'])
    .execute()
  for (const areaCategory of areaCategories) {
    urls.push({
      loc: `${origin}/${langId === 'en' ? '' : `${langId}/`}area/${areaCategory.areaId}/${areaCategory.categoryId}/${areaCategory.rankingType}`,
      lastmod: areaCategory.lastmod,
    })
  }

  // near me
  const nearMeAreaCategories = await db
    .selectFrom('localizedPlaces')
    .select([
      'areaId',
      'categoryId',
      sql<string>`strftime('%Y-%m-%dT%H:%M:%SZ', updated_at)`.as('lastmod'),
    ])
    .where('cityId', '==', cityId)
    .where('language', '==', langId)
    .groupBy(['areaId', 'categoryId'])
    .execute()
  for (const areaCategory of nearMeAreaCategories) {
    urls.push({
      loc: `${origin}/${langId === 'en' ? '' : `${langId}/`}area/${areaCategory.areaId}/${areaCategory.categoryId}/nearme`,
      lastmod: areaCategory.lastmod,
    })
  }

  const now = format(new UTCDate(), "yyyy-MM-dd'T'HH:mm:ssXXX")
  const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => {
    const lastmod = isAfter(now, new UTCDate(url.lastmod))
      ? format(now, "yyyy-MM-dd'T'HH:mm:ssXXX")
      : url.lastmod

    return `<url>
  <loc>${url.loc}</loc>
  <lastmod>${lastmod}</lastmod>
</url>
`
  })
  .join('')}</urlset>`

  return sitemap
}
