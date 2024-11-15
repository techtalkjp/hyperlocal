import { areas, categories, languages } from '@hyperlocal/consts'
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
  for (const area of areas.filter((a) => a.cityId === city.cityId)) {
    const { lastmod } = await db
      .selectFrom('localizedPlaces')
      .select(sql<string>`strftime('%Y-%m-%d', max(updated_at))`.as('lastmod'))
      .where('cityId', '==', city.cityId)
      .where('language', '==', lang.id)
      .where('areaId', '==', area.areaId)
      .executeTakeFirstOrThrow()
    urls.push({
      loc: `${origin}/${lang.id}/${city.cityId}/${area.areaId}`,
      lastmod,
    })

    for (const category of categories) {
      const { lastmod } = await db
        .selectFrom('localizedPlaces')
        .select(
          sql<string>`strftime('%Y-%m-%d', max(updated_at))`.as('lastmod'),
        )
        .where('cityId', '==', city.cityId)
        .where('language', '==', lang.id)
        .where('areaId', '==', area.areaId)
        .where('categoryId', '==', category.id)
        .executeTakeFirstOrThrow()

      urls.push({
        loc: `${origin}/${lang.id === 'en' ? '' : `${lang.id}/`}area/${area.areaId}/${category.id}/rating`,
        lastmod,
      })
      if (category.id === 'lunch' || category.id === 'dinner') {
        urls.push({
          loc: `${origin}/${lang.id === 'en' ? '' : `${lang.id}/`}area/${area.areaId}/${category.id}/review`,
          lastmod,
        })
      }
      urls.push({
        loc: `${origin}/${lang.id === 'en' ? '' : `${lang.id}/`}area/${area.areaId}/${category.id}/nearme`,
        lastmod,
      })
    }
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
