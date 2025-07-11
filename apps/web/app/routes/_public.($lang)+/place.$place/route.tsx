import { areas, categories } from '@hyperlocal/consts'
import { ChevronLeft } from 'lucide-react'
import type { HeadersFunction } from 'react-router'
import { Link, useSearchParams } from 'react-router'
import { z } from 'zod'
import { zx } from 'zodix'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Button,
} from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'
import { LocalizedPlaceDetails } from '~/features/place/components/localized-place-details'
import { generateCanonicalLink } from '~/features/seo/canonical-url'
import type { Route } from './+types/route'
import { getLocalizedPlace } from './queries.server'

export const headers: HeadersFunction = () => ({
  // cache for 30 days
  'Cache-Control':
    'public, max-age=14400, s-maxage=2592000, stale-while-revalidate=2592000',
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

  const place = await getLocalizedPlace({ placeId, language: lang.id })
  if (!place) {
    throw new Response('Not Found', { status: 404 })
  }

  return { placeId, city, lang, place }
}

export default function SpotDetail({
  loaderData: { lang, place },
}: Route.ComponentProps) {
  const [searchParams] = useSearchParams()
  const areaId = searchParams.get('area')
  const categoryId = searchParams.get('category')
  const rankType = searchParams.get('rank')
  const area = areas.find((a) => a.areaId === areaId)
  const category = categories.find((c) => c.id === categoryId)
  const rank = rankType ?? 'rating'

  const getBackToListUrl = () => {
    return `${lang.path}area/${area?.areaId}/${category?.id}/${rank}`
  }
  const isLinkedFromList = !!area && !!category

  return (
    <div className="grid gap-2">
      {isLinkedFromList && (
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
                    {area?.i18n[lang.id]}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={`${lang.path}area/${area?.areaId}/${category?.id}/${rank}`}
                    prefetch="viewport"
                    viewTransition
                    style={{
                      viewTransitionName: `nav-category-${category?.id}`,
                    }}
                  >
                    {category?.i18n[lang.id]}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div>
            <Button variant="ghost" asChild>
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
