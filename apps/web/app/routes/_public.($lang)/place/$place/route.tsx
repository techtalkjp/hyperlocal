import { zx } from '@coji/zodix/v4'
import { areas, categories } from '@hyperlocal/consts'
import { ChevronLeft } from 'lucide-react'
import { Link, redirect } from 'react-router'
import { z } from 'zod'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Button,
} from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'
import { RouteErrorBoundary } from '~/features/error/components/route-error-boundary'
import { LocalizedPlaceDetails } from '~/features/place/components/localized-place-details'
import { generateAlternateLinks } from '~/features/seo/alternate-links'
import { generateCanonicalLink } from '~/features/seo/canonical-url'
import { getLocalizedPlace, getPlaceIdByGoogleId, getPlaceListings } from './+queries.server'
import type { Route } from './+types/route'

export const headers: Route.HeadersFunction = () => ({
  // Browser caches briefly; edge keeps a day with background revalidation.
  // NOTE: s-maxage/must-revalidate would disable stale-while-revalidate,
  // so edge directives live in cloudflare-cdn-cache-control instead.
  'Cache-Control': 'public, max-age=60, stale-while-revalidate=60',
  'cloudflare-cdn-cache-control':
    'public, max-age=86400, stale-while-revalidate=3600',
  'Cache-Tag': 'place',
})

export const meta: Route.MetaFunction = ({ loaderData, location }) => {
  const placeName = loaderData?.place.displayName ?? 'Place'
  const cityName = loaderData?.city.i18n[loaderData.lang.id] ?? 'Tokyo'
  const rating = loaderData?.place.rating
  const reviewCount = loaderData?.place.userRatingCount
  return [
    {
      title: `${placeName}  - Hyperlocal ${cityName}`,
    },
    {
      name: 'description',
      content:
        rating != null
          ? `${placeName} in ${cityName} - rated ${rating} from ${reviewCount ?? 0} reviews. Check real-time open/closed status, photos and ratings on Hyperlocal ${cityName}.`
          : `${placeName} in ${cityName} - check real-time open/closed status, photos and ratings on Hyperlocal ${cityName}.`,
    },
    generateCanonicalLink(location.pathname),
    ...(loaderData
      ? generateAlternateLinks({
          url: location.pathname,
          placeId: loaderData.placeId,
        })
      : []),
  ]
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { place: placeId } = zx.parseParams(params, {
    place: z.string(),
  })
  const { city, lang } = getPathParams(request, params)
  const url = new URL(request.url)
  const areaIdParam = url.searchParams.get('area')
  const categoryIdParam = url.searchParams.get('category')
  const rankType = url.searchParams.get('rank') ?? 'rating'

  const place = await getLocalizedPlace({ placeId, language: lang.id })
  if (!place) {
    // 旧Google Place IDでのアクセスは自社IDに301リダイレクト
    const newPlaceId = await getPlaceIdByGoogleId({ googlePlaceId: placeId })
    if (newPlaceId) {
      throw redirect(`${lang.path}place/${newPlaceId}${url.search}`, 301)
    }
    throw new Response('Not Found', { status: 404 })
  }

  // クエリパラメータからエリア・カテゴリーを取得。なければPlaceListingから取得
  let areaId = areaIdParam
  let categoryId = categoryIdParam

  if (!areaId || !categoryId) {
    const listings = await getPlaceListings({ placeId })
    if (listings.length > 0) {
      // 最初のリスティングを使用（複数ある場合は距離計算で最適なものを選ぶことも可能）
      areaId = areaId ?? listings[0].areaId
      categoryId = categoryId ?? listings[0].categoryId
    }
  }

  const area = areas.find((a) => a.areaId === areaId)
  const category = categories.find((c) => c.id === categoryId)

  return { placeId, city, lang, place, area, category, rankType }
}

export default function SpotDetail({
  loaderData: { lang, place, area, category, rankType },
}: Route.ComponentProps) {
  const getBackToListUrl = () => {
    if (!area || !category) return `${lang.path}`
    return `${lang.path}area/${area.areaId}/${category.id}/${rankType}`
  }

  return (
    <div className="grid gap-2">
      {area && category && (
        <div className="px-1.5 md:px-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={`${lang.path}area/${area.areaId}`}
                    prefetch="viewport"
                    viewTransition
                    style={{
                      viewTransitionName: `area-title-${area.areaId}`,
                    }}
                  >
                    {area.i18n[lang.id]}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={`${lang.path}area/${area.areaId}/${category.id}/${rankType}`}
                    prefetch="viewport"
                    viewTransition
                    style={{
                      viewTransitionName: `nav-category-${category.id}`,
                    }}
                  >
                    {category.i18n[lang.id]}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div>
            <Button variant="outline" asChild>
              <Link to={getBackToListUrl()} prefetch="viewport" viewTransition>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to List
              </Link>
            </Button>
          </div>
        </div>
      )}

      <LocalizedPlaceDetails place={place} />
    </div>
  )
}

export const ErrorBoundary = () => {
  return <RouteErrorBoundary languageId="en" />
}
