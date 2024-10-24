import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'
import { NavLink, useLoaderData } from '@remix-run/react'
import { Stack, Tabs, TabsList, TabsTrigger } from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'
import { LocalizedPlaceCard } from '~/features/place/components/localized-place-card'
import { listLocalizedPlaces } from './queries.server'

export const headers: HeadersFunction = () => ({
  // cache for 30 days
  'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=2592000',
})

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { city, area, lang, category, rankingType } = getPathParams(
    request,
    params,
  )

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
    rankingType: rankingType ?? 'review',
  })

  return { places, city, area, category, lang, rankingType }
}

export default function CategoryIndexPage() {
  const { places, city, area, category, lang, rankingType } =
    useLoaderData<typeof loader>()

  return (
    <Stack className="gap-2">
      <Tabs value={rankingType}>
        <TabsList>
          <TabsTrigger value="rating">
            <NavLink to={'../rating'} prefetch="viewport">
              Top Rated
            </NavLink>
          </TabsTrigger>
          {(category.id === 'lunch' || category.id === 'dinner') && (
            <TabsTrigger value="review" asChild>
              <NavLink to={'../review'} prefetch="viewport">
                Most Popular
              </NavLink>
            </TabsTrigger>
          )}
          <TabsTrigger value="distance" asChild>
            <NavLink to={'../distance'} prefetch="viewport">
              Distance
            </NavLink>
          </TabsTrigger>
        </TabsList>
      </Tabs>

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
          to={`/${lang.id === 'en' ? '' : `${lang.id}/`}place/${place.placeId}?area=${area.areaId}&category=${category.id}&rank=${rankingType}`}
        />
      ))}
    </Stack>
  )
}
