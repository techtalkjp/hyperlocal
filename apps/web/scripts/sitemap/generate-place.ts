import { db, sql } from '@hyperlocal/db'

export const generatePlaceSitemap = async (
  origin: string,
  cityId: string,
  langId: string,
) => {
  const urls = []

  // rating, review
  const places = await db
    .selectFrom('localizedPlaces')
    .select([
      'placeId',
      sql<string>`strftime('%Y-%m-%dT%H:%M:%SZ', updated_at)`.as('lastmod'),
    ])
    .where('cityId', '==', cityId)
    .where('language', '==', langId)
    .execute()

  for (const place of places) {
    urls.push({
      loc: `${origin}/${langId === 'en' ? '' : `${langId}/`}place/${place.placeId}`,
      lastmod: place.lastmod,
    })
  }

  const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => {
    return `<url>
  <loc>${url.loc}</loc>
  <lastmod>${url.lastmod}</lastmod>
</url>
`
  })
  .join('')}</urlset>`

  return sitemap
}
