import { languages } from '@hyperlocal/consts'
import { db, sql } from '@hyperlocal/db'
import type { LoaderFunctionArgs } from 'react-router'
import { getPathParams } from '~/features/city-area/utils'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const origin = url.origin
  const { lang, city } = getPathParams(request, params)

  if (!languages.find((l) => l.id === params.lang)) {
    return new Response('Language not found', { status: 404 })
  }

  const urls = []

  // rating, review
  const areaCategories = await db
    .selectFrom('localizedPlaces')
    .select([
      'areaId',
      'categoryId',
      'rankingType',
      sql<string>`strftime('%Y-%m-%d', max(updated_at))`.as('lastmod'),
    ])
    .where('cityId', '==', city.cityId)
    .where('language', '==', lang.id)
    .groupBy(['areaId', 'categoryId', 'rankingType'])
    .execute()
  for (const areaCategory of areaCategories) {
    urls.push({
      loc: `${origin}/${lang.id === 'en' ? '' : `${lang.id}/`}area/${areaCategory.areaId}/${areaCategory.categoryId}/${areaCategory.rankingType}`,
      lastmod: areaCategory.lastmod,
    })
  }

  // near me
  const nearMeAreaCategories = await db
    .selectFrom('localizedPlaces')
    .select([
      'areaId',
      'categoryId',
      sql<string>`strftime('%Y-%m-%d', max(updated_at))`.as('lastmod'),
    ])
    .where('cityId', '==', city.cityId)
    .where('language', '==', lang.id)
    .groupBy(['areaId', 'categoryId', 'rankingType'])
    .execute()
  for (const areaCategory of nearMeAreaCategories) {
    urls.push({
      loc: `${origin}/${lang.id === 'en' ? '' : `${lang.id}/`}area/${areaCategory.areaId}/${areaCategory.categoryId}/nearme`,
      lastmod: areaCategory.lastmod,
    })
  }

  const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
  </url>
`,
  )
  .join('')}</urlset>`

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'xml-version': '1.0',
      encoding: 'UTF-8',
      'Cache-Control':
        'public, s-maxage=2592000, stale-while-revalidate=2592000',
    },
  })
}
