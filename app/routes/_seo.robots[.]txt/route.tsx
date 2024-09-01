import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'

export const headers: HeadersFunction = () => ({
  'Content-Type': 'application/xml;charset=utf-8',
  'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=2592000',
})

export const loader = ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const origin = url.origin

  const content = `# *
User-agent: *
Disallow: /admin

# Host
Host: ${origin}

# Sitemaps
Sitemap: ${origin}/sitemap.xml`

  return new Response(content)
}
