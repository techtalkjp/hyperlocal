import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'
import { NavLink, useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { zx } from 'zodix'
import { Stack, Tabs, TabsList, TabsTrigger } from '~/components/ui'
import { getLangCityAreaCategory } from '~/features/city-area/utils'
import { LocalizedPlaceCard } from '~/features/place/components/localized-place-card'
import { listLocalizedPlaces } from './queries.server'

export const headers: HeadersFunction = () => ({
  // cache for 30 days
  'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=2592000',
})

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { city, area, lang, category } = getLangCityAreaCategory(
    request,
    params,
  )
  const { rankingType } = zx.parseQuery(request, {
    rankingType: z
      .union([z.literal('review'), z.literal('rating')])
      .optional()
      .default('rating'),
  })

  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!lang) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const places = await listLocalizedPlaces({
    cityId: city.cityId,
    areaId: area.areaId,
    categoryId: category.id,
    language: lang.id,
    rankingType,
  })

  return { places, city, area, category, lang, rankingType }
}

export default function CategoryIndexPage() {
  const { places, city, area, category, lang, rankingType } =
    useLoaderData<typeof loader>()

  return (
    <Stack className="gap-4">
      {(category.id === 'lunch' || category.id === 'dinner') && (
        <Tabs value={rankingType}>
          <TabsList>
            <TabsTrigger value="rating">
              <NavLink to={'.'}>Top Rated</NavLink>
            </TabsTrigger>
            <TabsTrigger value="review" asChild>
              <NavLink to={'?rankingType=review'}>Most Popular</NavLink>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {places.length === 0 && (
        <div className="text-sm text-muted-foreground">No Places</div>
      )}
      {places.map((place, idx) => (
        <LocalizedPlaceCard
          key={place.placeId}
          place={place}
          no={idx + 1}
          loading={idx <= 5 ? 'eager' : 'lazy'}
          withOriginalName={city.language !== lang.id}
          to={`/${lang.id === 'en' ? '' : `${lang.id}/`}place/${place.placeId}?area=${area.areaId}&category=${category.id}&rankingType=${rankingType}`}
        />
      ))}
    </Stack>
  )
}
