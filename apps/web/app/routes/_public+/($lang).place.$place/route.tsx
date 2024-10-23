import { areas, categories } from '@hyperlocal/consts'
import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'
import { Link, type MetaFunction, useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { zx } from 'zodix'
import { getLangCityAreaCategory } from '~/features/city-area/utils'

export const headers: HeadersFunction = () => ({
  // cache for 30 days
  'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=2592000',
})

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.place.displayName}  - Hyperlocal ${data?.city.i18n[data.language.id]}`,
    },
  ]
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { place: placeId } = zx.parseParams(params, {
    place: z.string(),
  })

  const { area: areaId, category: categoryId } = zx.parseQuery(request, {
    area: z.string().optional(),
    category: z.string().optional(),
  })

  const { city, lang: language } = getLangCityAreaCategory(request, params)
  const area = areas.find((a) => a.areaId === areaId)
  const category = categories.find((c) => c.id === categoryId)

  const place = await getLocalizedPlace({ placeId, language: language.id })
  if (!place) {
    throw new Response('Not Found', { status: 404 })
  }

  return { placeId, city, language, area, category, place }
}

import { ChevronLeft } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Button,
} from '~/components/ui'
import { LocalizedPlaceDetails } from '~/features/place/components/localized-place-details'
import { getLocalizedPlace } from './queries.server'

export default function SpotDetail() {
  const { language, city, area, category, place } =
    useLoaderData<typeof loader>()

  const languagePath = language.id === 'en' ? '' : `${language.path}/`
  const getBackToListUrl = () => {
    return `/${languagePath}area/${area?.areaId}/${category?.id}`
  }

  const isLinkedFromList = !!area && !!category

  return (
    <div className="grid gap-2">
      {isLinkedFromList && (
        <>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/${languagePath}`}>{city.i18n[language.id]}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${languagePath}area/${area?.areaId}`}>
                  {area?.i18n[language.id]}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/${languagePath}area/${area?.areaId}/${category?.id}`}
                >
                  {category?.i18n[language.id]}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={getBackToListUrl()}>List</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div>
            <Button variant="ghost" asChild>
              <Link to={getBackToListUrl()}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to List
              </Link>
            </Button>
          </div>
        </>
      )}

      <LocalizedPlaceDetails place={place} />
    </div>
  )
}
