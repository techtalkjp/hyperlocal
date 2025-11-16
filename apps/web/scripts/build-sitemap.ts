import { languages } from '@hyperlocal/consts'
import fs from 'node:fs'
import path from 'node:path'
import { generateIndexSitemap } from './sitemap/generate-index'
import { generateRankSitemap } from './sitemap/generate-rank'

const __filename = new URL(import.meta.url).pathname
const __dirname = path.dirname(__filename)
// Define output directory - use build/client for production
const outputDir = path.resolve(__dirname, '../build/client')
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

const main = async () => {
  // Generate and write sitemap.xml
  const sitemapIndex = generateIndexSitemap(origin)
  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemapIndex)

  // Generate and write sitemap/rank-{lang}.xml
  for (const lang of languages) {
    // area category ranks
    const sitemapAreaCategoryRankContent = await generateRankSitemap(
      origin,
      'tokyo',
      lang.id,
    )
    fs.writeFileSync(
      path.join(outputDir, `sitemap/rank-${lang.id}.xml`),
      sitemapAreaCategoryRankContent,
    )

    // places
    // const sitemapPlaceContent = await generatePlaceSitemap(origin, 'tokyo', lang.id)
    // fs.writeFileSync(
    //   path.join(outputDir, `sitemap/place-${lang.id}.xml.gz`),
    //   gzip(sitemapPlaceContent),
    // )
  }

  console.log('Sitemaps generated successfully.')
}

await main()
