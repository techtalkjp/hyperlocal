import { UTCDate } from '@date-fns/utc'
import { db, sql } from '@hyperlocal/db'
import { format, isAfter } from 'date-fns'

export const generateRankSitemap = async (
  origin: string,
  cityId: string,
  langId: string,
) => {
  const urls = []
  const now = format(new UTCDate(), "yyyy-MM-dd'T'HH:mm:ssXXX")

  // Top page
  urls.push({
    loc: `${origin}${langId === 'en' ? '/' : `/${langId}`}`,
    lastmod: now,
    priority: 1.0,
  })

  // Area pages
  const areas = await db
    .selectFrom('localizedPlaces')
    .select([
      'areaId',
      sql<string>`strftime('%Y-%m-%dT%H:%M:%SZ', updated_at)`.as('lastmod'),
    ])
    .where('cityId', '==', cityId)
    .where('language', '==', langId)
    .groupBy(['areaId'])
    .execute()
  for (const area of areas) {
    urls.push({
      loc: `${origin}/${langId === 'en' ? '' : `${langId}/`}area/${area.areaId}`,
      lastmod: area.lastmod,
      priority: 0.8,
    })
  }

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
      priority: 0.6,
    })
  }

  // NOTE: nearme ページは位置情報依存の個別化コンテンツのため
  // sitemapに含めない(SEO対象外。noindexはルート側のmetaで指定)。
  // かつてはここで nearme URLを列挙していたが、titleなし空headの
  // 薄いコンテンツとしてGoogleの評価を下げたため除外した(2026-09)。

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
