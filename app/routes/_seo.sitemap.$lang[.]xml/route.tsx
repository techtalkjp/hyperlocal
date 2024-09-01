import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'
import areas from '~/consts/areas'
import categories from '~/consts/categories'
import languages from '~/consts/languages'
import { getLangCityAreaCategory } from '~/features/city-area/utils'
import { db } from '~/services/db'

export const headers: HeadersFunction = () => ({
  'Content-Type': 'application/xml;charset=utf-8',
  'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=2592000',
})

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const origin = url.origin
  const { lang, city } = getLangCityAreaCategory(request, params)

  if (!languages.find((l) => l.id === params.lang)) {
    return new Response('Language not found', { status: 404 })
  }

  const urls = []
  for (const area of areas.filter((a) => a.cityId === city.cityId)) {
    const { lastmod } = await db
      .selectFrom('localizedPlaces')
      .select((eb) => eb.fn('max', ['updatedAt']).as('lastmod'))
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
        .select((eb) => eb.fn('max', ['updatedAt']).as('lastmod'))
        .where('cityId', '==', city.cityId)
        .where('language', '==', lang.id)
        .where('areaId', '==', area.areaId)
        .where('categoryId', '==', category.id)
        .executeTakeFirstOrThrow()

      urls.push({
        loc: `${origin}/${lang.id}/${city.cityId}/${area.areaId}/${category.id}`,
        lastmod,
      })
    }
  }

  return new Response(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
  </url>
`,
  )
  .join('')}</urlset>`)
}