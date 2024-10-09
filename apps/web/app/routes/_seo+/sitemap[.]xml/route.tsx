import { languages } from '@hyper-local/consts'
import type { LoaderFunctionArgs } from '@remix-run/node'

export const loader = ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const origin = url.origin

  const sitemaps = languages.map((lang) => ({
    loc: `${origin}/sitemap/${lang.id}.xml`,
  }))

  const content = `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (sitemap) => `  <sitemap>
    <loc>${sitemap.loc}</loc>
  </sitemap>
`,
  )
  .join('')}</sitemapindex>`

  return new Response(content, {
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
