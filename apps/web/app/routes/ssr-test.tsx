import { db } from '@hyperlocal/db'
import { getMDXComponent } from 'mdx-bundler/client/index.js'
import type { Route } from './+types/ssr-test'

export const loader = async () => {
  const startTime = Date.now()
  const timings: Record<string, number> = {}

  // 1. DB query timing
  const dbStart = Date.now()
  const article = await db
    .selectFrom('areaArticles')
    .selectAll()
    .where('status', '=', 'published')
    .limit(1)
    .executeTakeFirst()
  timings.dbQuery = Date.now() - dbStart

  if (!article) {
    throw new Response('No article found', { status: 404 })
  }

  // 2. Place extraction timing
  const extractStart = Date.now()
  const placeIdMatches = article.content.matchAll(
    /<Place\s+id="([^"]+)"\s*\/>/g,
  )
  const placeIds = Array.from(placeIdMatches, (match) => match[1])
  timings.extractPlaces = Date.now() - extractStart

  // 3. Place data fetch timing
  const placesStart = Date.now()
  const places =
    placeIds.length > 0
      ? await db
          .selectFrom('localizedPlaces')
          .selectAll()
          .where('placeId', 'in', placeIds)
          .where('language', '=', 'ja')
          .execute()
      : []
  timings.fetchPlaces = Date.now() - placesStart

  const placesMap = Object.fromEntries(places.map((p) => [p.placeId, p]))

  timings.total = Date.now() - startTime

  return {
    article,
    mdxCode: article.compiledCode,
    placesMap,
    timings,
  }
}

export default function SSRTestPage({ loaderData }: Route.ComponentProps) {
  const { article, mdxCode, placesMap, timings } = loaderData

  // MDX component creation timing (happens during render)
  // Note: Not using useMemo to accurately measure getMDXComponent performance
  const componentStart = Date.now()
  const Component = getMDXComponent(mdxCode)
  const componentTime = Date.now() - componentStart

  const Place = ({ id }: { id: string }) => {
    const place = placesMap[id]
    if (!place) return <div>Place not found: {id}</div>
    return (
      <div className="my-6 rounded border p-4">
        <h3 className="font-bold">{place.displayName}</h3>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 text-3xl font-bold">SSR Performance Test</h1>

      <div className="mb-8 rounded bg-yellow-50 p-4">
        <h2 className="mb-4 font-bold">Server-side Timings (loader):</h2>
        <ul className="space-y-1 font-mono text-sm">
          <li>DB Query: {timings.dbQuery}ms</li>
          <li>Extract Places: {timings.extractPlaces}ms</li>
          <li>Fetch Places: {timings.fetchPlaces}ms</li>
          <li className="font-bold">Total Loader: {timings.total}ms</li>
        </ul>
      </div>

      <div className="mb-8 rounded bg-blue-50 p-4">
        <h2 className="mb-4 font-bold">Client-side Timings (render):</h2>
        <ul className="space-y-1 font-mono text-sm">
          <li>getMDXComponent: {componentTime}ms</li>
        </ul>
      </div>

      <div className="rounded border p-6">
        <h2 className="mb-4 text-2xl font-bold">{article.title}</h2>
        <div className="prose max-w-none">
          <Component components={{ Place }} />
        </div>
      </div>
    </div>
  )
}
