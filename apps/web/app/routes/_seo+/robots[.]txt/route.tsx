import type { LoaderFunctionArgs } from 'react-router';

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

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control':
        'public, s-maxage=2592000, stale-while-revalidate=2592000',
    },
  })
}
