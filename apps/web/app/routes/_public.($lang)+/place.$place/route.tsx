import { zx } from '@coji/zodix/v4'
import { areas, categories } from '@hyperlocal/consts'
import { ChevronLeft } from 'lucide-react'
import type { HeadersFunction } from 'react-router'
import { Link } from 'react-router'
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
import { generateCanonicalLink } from '~/features/seo/canonical-url'
import type { Route } from './+types/route'
import { getLocalizedPlace, getPlaceListings } from './queries.server'

export const headers: HeadersFunction = () => ({
  // Development: short cache for content updates
  // Production: cache for 4 hours with stale-while-revalidate
  'Cache-Control':
    process.env.NODE_ENV === 'production'
      ? 'public, max-age=14400, s-maxage=14400, stale-while-revalidate=86400'
      : 'public, max-age=0, must-revalidate',
})

export const meta: Route.MetaFunction = ({ data, location }) => {
  return [
    {
      title: `${data?.place.displayName}  - Hyperlocal ${data?.city.i18n[data.lang.id]}`,
    },
    generateCanonicalLink(location.pathname),
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
