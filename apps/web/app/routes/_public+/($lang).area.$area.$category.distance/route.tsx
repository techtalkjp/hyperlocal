import { categories } from '@hyperlocal/consts/src'
import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'
import {
  type ClientLoaderFunctionArgs,
  NavLink,
  useLoaderData,
  useParams,
} from '@remix-run/react'
import { Stack, Tabs, TabsList, TabsTrigger } from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'
import { LocalizedPlaceCard } from '~/features/place/components/localized-place-card'
import { sortLocalizedPlaceByDistance } from './distance'
import { listLocalizedPlaces } from './queries.server'

export const headers: HeadersFunction = () => ({
  // cache for 30 days
  'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=2592000',
})

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { city, area, lang, category } = getPathParams(request, params)

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
    rankingType: 'distance',
  })

  return { places, city, area, category, lang }
}

export const clientLoader = async ({
  serverLoader,
}: ClientLoaderFunctionArgs) => {
  const { places, ...loaderResponses } = await serverLoader<typeof loader>()

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject)
  }).catch((e) => {
    console.log(e)
    return null
  })
  if (!position) {
    throw new Error('Geolocation not available')
  }

  const sortedPlaces = sortLocalizedPlaceByDistance(
    places,
    position.coords.latitude,
    position.coords.longitude,
  )

  return { places: sortedPlaces, ...loaderResponses, position }
}
clientLoader.hydrate = true

export default function CategoryIndexPage() {
  const { places, city, area, category, lang } =
    useLoaderData<typeof clientLoader>()

  return (
    <Stack className="gap-2">
      <Tabs value={'distance'}>
        <TabsList>
          <TabsTrigger value="rating">
            <NavLink to={'../rating'}>Top Rated</NavLink>
          </TabsTrigger>
          {(category.id === 'lunch' || category.id === 'dinner') && (
            <TabsTrigger value="review" asChild>
              <NavLink to={'../review'}>Most Popular</NavLink>
            </TabsTrigger>
          )}
          <TabsTrigger value="distance" asChild>
            <NavLink to={'../distance'}>Distance</NavLink>
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
          distance={place.distance}
          no={idx + 1}
          loading={idx <= 5 ? 'eager' : 'lazy'}
          withOriginalName={city.language !== lang.id}
          to={`/${lang.id === 'en' ? '' : `${lang.id}/`}place/${place.placeId}?area=${area.areaId}&category=${category.id}&rank=distance`}
        />
      ))}
    </Stack>
  )
}

export const HydrateFallback = () => {
  const params = useParams()
  const category = categories.find((c) => c.id === params.category)

  return (
    <Stack className="gap-2">
      <Tabs value={'distance'}>
        <TabsList>
          <TabsTrigger value="rating">
            <NavLink to={'../rating'} prefetch="viewport">
              Top Rated
            </NavLink>
          </TabsTrigger>
          {(category?.id === 'lunch' || category?.id === 'dinner') && (
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

      <div className="text-muted-foreground">Loading...</div>
    </Stack>
  )
}
