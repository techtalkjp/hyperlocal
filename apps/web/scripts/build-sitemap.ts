import { UTCDate } from '@date-fns/utc'
import { languages } from '@hyperlocal/consts'
import { db, sql } from '@hyperlocal/db'
import { format, isAfter } from 'date-fns'
import fs from 'node:fs'
import path from 'node:path'

const __filename = new URL(import.meta.url).pathname
const __dirname = path.dirname(__filename)
// Define output directory
const outputDir = path.resolve(__dirname, '../public')
const origin = 'https://tokyo.hyper-local.app'

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Ensure the 'sitemap' directory exists
const sitemapDir = path.join(outputDir, 'sitemap')
if (!fs.existsSync(sitemapDir)) {
  fs.mkdirSync(sitemapDir, { recursive: true })
}

// Function to generate sitemap content
const generateSitemap = async (cityId: string, langId: string) => {
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
      sql<string>`strftime('%Y-%m-%d', max(updated_at))`.as('lastmod'),
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

  const now = new UTCDate('2024-11-29') // Set the updated date for Google bot
  const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => {
    const lastmod = isAfter(now, new UTCDate(url.lastmod))
      ? format(now, 'yyyy-MM-dd')
      : url.lastmod

    return `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
  </url>
`
  })
  .join('')}</urlset>`

  return sitemap
}

const main = async () => {
  // Generate and write sitemap.xml
  const sitemapIndex = `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${languages
  .map(
    (lang) => `  <sitemap>
    <loc>${origin}/sitemap/${lang.id}.xml</loc>
  </sitemap>`,
  )
  .join('\n')}</sitemapindex>`
  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemapIndex, 'utf8')

  // Generate and write sitemap/en.xml
  for (const lang of languages) {
    const sitemapLangContent = await generateSitemap('tokyo', lang.id)
    fs.writeFileSync(
      path.join(outputDir, `sitemap/${lang.id}.xml`),
      sitemapLangContent,
      'utf8',
    )
  }

  console.log('Sitemaps generated successfully.')
}

main()
