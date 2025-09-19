import { LoaderIcon } from 'lucide-react'
import {
  type ClientLoaderFunctionArgs,
  href,
  NavLink,
  useLoaderData,
} from 'react-router'
import { match } from 'ts-pattern'
import { Stack, Tabs, TabsList, TabsTrigger } from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'
import { LocalizedPlaceCard } from '~/features/place/components/localized-place-card'
import { generateAlternateLinks } from '~/features/seo/alternate-links'
import { generateCanonicalLink } from '~/features/seo/canonical-url'
import { generateAreaCategoryMetaDescription } from '~/features/seo/meta-area-category'
import { sortLocalizedPlaceByDistance } from '~/services/distance'
import type { Route } from './+types/route'
import { listLocalizedPlaces } from './queries.server'

export const headers: Route.HeadersFunction = () => ({
  // cache for 30 days
  'Cache-Control':
    'public, max-age=14400, s-maxage=2592000, stale-while-revalidate=2592000',
})

export const meta = ({ data, location }: Route.MetaArgs) => {
  if (!data || !data.url) return []

  const rankingTitle = match(data.rankingType)
    .with('review', () => 'Most Popular')
    .with('rating', () => 'Top Rated')
    .with('nearme', () => 'Near Me')
    .otherwise(() => '')

  return [
    {
      title: `${rankingTitle} ${data.area.i18n[data.lang.id]} ${data.category.i18n[data.lang.id]} - Hyperlocal ${data?.city.i18n[data.lang.id]}`,
    },
    {
      name: 'description',
      content: generateAreaCategoryMetaDescription(
        data.city.cityId,
        data.area.areaId,
        data.category.id,
        data.lang.id,
      ),
    },
    generateCanonicalLink(location.pathname),
    ...generateAlternateLinks({
      url: data.url,
      areaId: data.area.areaId,
      categoryId: data.category.id,
      rankingType: data.rankingType,
    }),
    {
      'script:ld+json': {
        '@context': 'http://schema.org',
        '@type': 'LocalBusiness',
        name: `${data.city.i18n[data.lang.id]} ${data.area.i18n[data.lang.id]} ${data.category.i18n[data.lang.id]}`,
        description: generateAreaCategoryMetaDescription(
          data.city.cityId,
          data.area.areaId,
          data.category.id,
          data.lang.id,
        ),
        url: new URL(
          `${data.lang.path}area/${data.area.areaId}/${data.category.id}/${data.rankingType}`,
          data.url,
        ).toString(),
      },
    },
  ]
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { city, lang, area, category } = getPathParams(request, params, {
    require: {
      area: true,
      category: true,
    },
  })

  const places = await listLocalizedPlaces({
    cityId: city.cityId,
    areaId: area.areaId,
    categoryId: category.id,
    language: lang.id,
    rankingType: 'nearme',
  })

  return {
    url: request.url,
    places,
    city,
    area,
    category,
    lang,
    rankingType: 'nearme',
  }
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
  const { places, area, category, lang } = useLoaderData<typeof clientLoader>()

  return (
    <Stack className="gap-2">
      <Tabs value="nearme">
        <TabsList>
          <TabsTrigger value="rating">
            <NavLink
              to={href('/:lang?/area/:area/:category/:rank', {
                lang: lang.id !== 'en' ? lang.id : undefined,
                area: area.areaId,
                category: category.id,
                rank: 'rating',
              })}
              prefetch="viewport"
              viewTransition
            >
              Top Rated
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="review" asChild>
            <NavLink
              to={href('/:lang?/area/:area/:category/:rank', {
                lang: lang.id !== 'en' ? lang.id : undefined,
                area: area.areaId,
                category: category.id,
                rank: 'review',
              })}
              prefetch="viewport"
              viewTransition
            >
              Most Popular
            </NavLink>
          </TabsTrigger>
          <TabsTrigger
            value="nearme"
            className="border data-[state=active]:border-blue-500 data-[state=active]:text-blue-500"
            asChild
          >
            <NavLink
              to={href('/:lang?/area/:area/:category/:rank', {
                lang: lang.id !== 'en' ? lang.id : undefined,
                area: area.areaId,
                category: category.id,
                rank: 'nearme',
              })}
              prefetch="viewport"
              viewTransition
            >
              Near Me
            </NavLink>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {places.length === 0 && (
        <div className="text-muted-foreground text-sm">No Places</div>
      )}
      {places.map((place, idx) => (
        <LocalizedPlaceCard
          key={place.placeId}
          place={place}
          distance={place.distance}
          no={idx + 1}
          loading={idx <= 5 ? 'eager' : 'lazy'}
          to={`${lang.path}place/${place.placeId}?area=${area.areaId}&category=${category.id}&rank=nearme`}
        />
      ))}
    </Stack>
  )
}

export const HydrateFallback = () => {
  return (
    <Stack className="gap-2">
      <Tabs value="nearme">
        <TabsList>
          <TabsTrigger value="rating">
            <NavLink to={'../rating'} prefetch="viewport" viewTransition>
              Top Rated
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="review" asChild>
            <NavLink to={'../review'} prefetch="viewport" viewTransition>
              Most Popular
            </NavLink>
          </TabsTrigger>
          <TabsTrigger
            value="nearme"
            className="border data-[state=active]:border-blue-500 data-[state=active]:text-blue-500"
            asChild
          >
            <NavLink to={'../nearme'} prefetch="viewport" viewTransition>
              Near Me
              <LoaderIcon className="ml-2 inline h-4 w-4 animate-spin text-blue-500" />
            </NavLink>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="text-muted-foreground">Loading...</div>
    </Stack>
  )
}
