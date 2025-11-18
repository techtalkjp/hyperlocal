import { UTCDate } from '@date-fns/utc'
import { scenes } from '@hyperlocal/consts'
import { getMDXComponent } from 'mdx-bundler/client/index.js'
import { data, Link } from 'react-router'
import { ClientOnly } from 'remix-utils/client-only'
import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  HStack,
  Stack,
} from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'
import { BusinessStatusBadge } from '~/features/place/components'
import {
  type BusinessHours,
  getBusinessStatus,
  priceLevelLabel,
} from '~/features/place/utils'
import type { Route } from './+types/route'
import {
  getArticle,
  getLocalizedPlacesByIds,
  getOtherArticlesForArea,
} from './queries.server'

export const meta = ({ data }: Route.MetaArgs) => {
  if (!data?.article) {
    return [{ title: 'Article Not Found' }]
  }

  return [
    { title: data.article.title },
    { name: 'description', content: data.article.metadata.description },
  ]
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { lang, city, area } = getPathParams(request, params, {
    require: { area: true },
  })

  const sceneId = params.scene
  if (!sceneId) {
    throw new Response('Not Found', { status: 404 })
  }

  const scene = scenes.find((s) => s.id === sceneId)
  if (!scene) {
    throw new Response('Not Found', { status: 404 })
  }

  const article = await getArticle(city.cityId, area.areaId, sceneId, lang.id)
  if (!article) {
    throw data(
      { error: 'Article not found', lang, city, area, scene },
      { status: 404 },
    )
  }

  // Extract place IDs from article content
  const placeIdMatches = article.content.matchAll(
    /<Place\s+id="([^"]+)"\s*\/>/g,
  )
  const placeIds = Array.from(placeIdMatches, (match) => match[1])

  // Fetch place data for all referenced places in a single query
  const places = await getLocalizedPlacesByIds(placeIds, lang.id)

  // Create a map of place data
  const placesMap = Object.fromEntries(
    places.map((place) => [place.placeId, place]),
  )

  // Get other articles for this area
  const otherArticles = await getOtherArticlesForArea(
    city.cityId,
    area.areaId,
    lang.id,
    sceneId,
  )

  return {
    lang,
    city,
    area,
    scene,
    article,
    mdxCode: article.compiledCode,
    placesMap,
    otherArticles,
  }
}

export default function AreaGuideScenePage({
  loaderData,
}: Route.ComponentProps) {
  const { lang, area, scene, article, mdxCode, placesMap, otherArticles } =
    loaderData

  // Note: Not using useMemo per CLAUDE.md guidelines - getMDXComponent is pure and fast
  const Component = getMDXComponent(mdxCode)

  // Place component for use in MDX
  const Place = ({ id }: { id: string }) => {
    const place = placesMap[id]

    if (!place) {
      return (
        <div className="my-6 rounded border p-4">
          <div className="text-muted-foreground text-sm">
            Place not found: {id}
          </div>
        </div>
      )
    }

    const placePath =
      lang.id === 'en' ? `/place/${id}` : `/${lang.id}/place/${id}`
    const reviewText =
      place.reviews?.length > 0 && typeof place.reviews[0].text === 'string'
        ? place.reviews[0].text
        : null

    return (
      <Link
        to={placePath}
        className="hover:bg-secondary my-6 block rounded-lg border p-0 shadow-sm transition-all hover:shadow-md"
        viewTransition
      >
        <div className="flex gap-4">
          {/* Photo */}
          <div className="bg-muted h-32 w-32 shrink-0 overflow-hidden rounded-l-lg sm:h-40 sm:w-40">
            {place.photos.length > 0 ? (
              <img
                src={place.photos[0]}
                alt={place.displayName}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                No Photo
              </div>
            )}
          </div>

          {/* Info */}
          <Stack className="flex-1 gap-2 py-3 pr-4">
            <div className="text-lg leading-tight font-semibold sm:text-xl">
              {place.displayName}
            </div>

            {/* Rating */}
            {place.rating && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <span className="font-semibold text-yellow-600">
                  ★ {place.rating.toFixed(1)}
                </span>
                <span className="text-xs">
                  ({place.userRatingCount} reviews)
                </span>
              </div>
            )}

            {/* Business Status & Price */}
            <HStack className="text-xs">
              <ClientOnly
                fallback={
                  <span className="text-xs text-transparent">Status</span>
                }
              >
                {() => {
                  const date = new UTCDate()
                  const businessStatusResult = getBusinessStatus(
                    place.regularOpeningHours as unknown as BusinessHours | null,
                    date,
                    loaderData.city.timezone,
                  )
                  return (
                    <BusinessStatusBadge statusResult={businessStatusResult} />
                  )
                }}
              </ClientOnly>
              {place.priceLevel && (
                <>
                  <span className="text-muted-foreground mx-1">⋅</span>
                  <span className="text-muted-foreground">
                    {priceLevelLabel(place.priceLevel)}
                  </span>
                </>
              )}
            </HStack>

            {/* Review excerpt */}
            {reviewText && (
              <div className="text-muted-foreground line-clamp-2 text-sm italic">
                "{reviewText}"
              </div>
            )}

            {/* Genres */}
            {place.genres.length > 0 && (
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                {place.genres.slice(0, 3).map((genre) => (
                  <Badge
                    key={genre}
                    variant="outline"
                    className="bg-muted text-muted-foreground rounded border-none px-1 py-1 text-xs font-semibold capitalize"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </Stack>
        </div>
      </Link>
    )
  }

  const areaPath =
    lang.id === 'en'
      ? `/area/${area.areaId}`
      : `/${lang.id}/area/${area.areaId}`

  return (
    <Stack className="gap-8">
      {/* Breadcrumb */}
      <nav className="text-muted-foreground mx-auto w-full max-w-3xl px-4 text-sm">
        <Link to={areaPath} className="hover:underline">
          {area.i18n[lang.id]}
        </Link>
        <span className="mx-2">/</span>
        <span>{scene.i18n[lang.id]}</span>
      </nav>

      {/* Article */}
      <article className="mx-auto w-full max-w-3xl px-4">
        <h1 className="mb-8 text-4xl leading-tight font-bold tracking-tight">
          {article.title}
        </h1>
        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none [&_h1]:hidden [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-3xl [&_h2]:font-bold [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-2xl [&_h3]:font-bold [&_p]:my-4 [&_p]:text-lg [&_p]:leading-relaxed">
          <Component components={{ Place }} />
        </div>
      </article>

      {/* Other guides for this area */}
      {otherArticles.length > 0 && (
        <div className="border-border mx-auto w-full max-w-3xl border-t px-4 pt-8">
          <h3 className="mb-3 font-semibold">
            Other Guides for {area.i18n[lang.id]}
          </h3>
          <div className="grid gap-2">
            {otherArticles.map((otherArticle) => {
              const otherScene = scenes.find(
                (s) => s.id === otherArticle.sceneId,
              )
              const otherGuidePath =
                lang.id === 'en'
                  ? `/area/${area.areaId}/guide/${otherArticle.sceneId}`
                  : `/${lang.id}/area/${area.areaId}/guide/${otherArticle.sceneId}`
              return (
                <Link
                  to={otherGuidePath}
                  key={otherArticle.sceneId}
                  prefetch="viewport"
                  viewTransition
                >
                  <Card className="hover:bg-secondary">
                    <CardHeader>
                      <CardTitle className="text-base">
                        {otherArticle.title}
                      </CardTitle>
                      {otherScene && (
                        <p className="text-muted-foreground text-sm">
                          {otherScene.description[lang.id]}
                        </p>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </Stack>
  )
}
