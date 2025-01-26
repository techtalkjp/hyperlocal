import { UTCDate } from '@date-fns/utc'
import { languages } from '@hyperlocal/consts'
import { format } from 'date-fns'

export const generateIndexSitemap = (origin: string) => {
  const now = format(new UTCDate(), "yyyy-MM-dd'T'HH:mm:ssXXX")
  const sitemapIndex = `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${languages
  .map(
    (lang) => `<sitemap>
  <loc>${origin}/sitemap/rank-${lang.id}.xml.gz</loc>
  <lastmod>${now}</lastmod>
</sitemap>
<sitemap>
  <loc>${origin}/sitemap/place-${lang.id}.xml.gz</loc>
  <lastmod>${now}</lastmod>
</sitemap>`,
  )
  .join('\n')}</sitemapindex>`
  return sitemapIndex
}
