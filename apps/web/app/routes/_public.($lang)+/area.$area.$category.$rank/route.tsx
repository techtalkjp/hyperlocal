import { LoaderIcon } from 'lucide-react'
import type { LoaderFunctionArgs } from 'react-router'
import { NavLink, useLoaderData } from 'react-router'
import { match } from 'ts-pattern'
import { Stack, Tabs, TabsList, TabsTrigger } from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'
import { LocalizedPlaceCard } from '~/features/place/components/localized-place-card'
import { generateAlternateLinks } from '~/features/seo/alternate-links'
import { generateAreaCategoryMetaDescription } from '~/features/seo/meta-area-category'
import type { Route } from './+types/route'
import { listLocalizedPlaces } from './queries.server'

export const headers: Route.HeadersFunction = () => ({
  // cache for 30 days
  'Cache-Control':
    'public, max-age=14400, s-maxage=2592000, stale-while-revalidate=2592000',
})

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data || !data.url) return []

  const rankingTitle = match(data.rankingType)
    .with('review', () => 'Most Popular')
    .with('rating', () => 'Top Rated')
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
    rankingType: rankingType ?? 'rating',
  })

  return { url: request.url, places, city, area, category, lang, rankingType }
}

export default function CategoryIndexPage() {
  const { places, city, area, category, lang, rankingType } =
    useLoaderData<typeof loader>()

  return (
    <Stack className="gap-2">
      <Tabs value={rankingType}>
        <TabsList>
          <TabsTrigger value="rating">
            <NavLink to={'../rating'} viewTransition>
              Top Rated
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="review" asChild>
            <NavLink to={'../review'} viewTransition>
              Most Popular
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="nearme" asChild>
            <NavLink to={'../nearme'} viewTransition>
              {({ isPending }) => (
                <span>
                  Near Me
                  {isPending && (
                    <LoaderIcon className="ml-2 inline h-4 w-4 animate-spin text-blue-500" />
                  )}
                </span>
              )}
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
          no={idx + 1}
          loading={idx <= 5 ? 'eager' : 'lazy'}
          to={`${lang.path}place/${place.placeId}?area=${area.areaId}&category=${category.id}&rank=${rankingType}`}
        />
      ))}
    </Stack>
  )
}
