import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'
import cities from '~/consts/cities'

export const headers: HeadersFunction = () => ({
  'Content-Type': 'application/xml;charset=utf-8',
  'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=2592000',
})

export const loader = ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const host = url.host.split('.')[0]

  const city = cities.find((city) => city.cityId === host) ?? cities[0]

  const content = `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://hogosuru.dailove.com/sitemap-0.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://hogosuru.dailove.com/sitemap/chemicals.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://hogosuru.dailove.com/sitemap/news.xml</loc>
  </sitemap>
</sitemapindex>`

  return new Response(content)
}
