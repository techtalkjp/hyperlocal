import { areas, categories } from '@hyperlocal/consts'
import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'
import { Link, type MetaFunction, useLoaderData } from '@remix-run/react'
import { ChevronLeft } from 'lucide-react'
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
import { getLocalizedPlace } from './queries.server'

export const headers: HeadersFunction = () => ({
  // cache for 30 days
  'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=2592000',
})

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.place.displayName}  - Hyperlocal ${data?.city.i18n[data.lang.id]}`,
    },
  ]
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { place: placeId } = zx.parseParams(params, {
    place: z.string(),
  })

  const {
    area: areaId,
    category: categoryId,
    rank: rankingType,
  } = zx.parseQuery(request, {
    area: z.string().optional(),
    category: z.string().optional(),
    rank: z.string().optional(),
  })

  const { city, lang } = getPathParams(request, params)
  const area = areas.find((a) => a.areaId === areaId)
  const category = categories.find((c) => c.id === categoryId)
  const rank = rankingType ?? 'review'

  const place = await getLocalizedPlace({ placeId, language: lang.id })
  if (!place) {
    throw new Response('Not Found', { status: 404 })
  }

  return { placeId, city, lang, area, category, rank, place }
}

export default function SpotDetail() {
  const { lang, city, area, category, rank, place } =
    useLoaderData<typeof loader>()

  const languagePath = lang.id === 'en' ? '' : `${lang.path}/`
  const getBackToListUrl = () => {
    return `/${languagePath}area/${area?.areaId}/${category?.id}/${rank}`
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
                    to={`/${languagePath}area/${area?.areaId}`}
                    viewTransition
                    style={{
                      viewTransitionName: `nav-area-${area?.areaId}`,
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
                    to={`/${languagePath}area/${area?.areaId}/${category?.id}/${rank}`}
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
              <Link to={getBackToListUrl()} viewTransition>
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
