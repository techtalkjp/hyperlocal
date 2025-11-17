import { LoaderIcon } from 'lucide-react'
import { href, NavLink } from 'react-router'
import { match } from 'ts-pattern'
import { Stack, Tabs, TabsList, TabsTrigger } from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'
import { LocalizedPlaceCard } from '~/features/place/components/localized-place-card'
import { generateAlternateLinks } from '~/features/seo/alternate-links'
import {
  generateCanonicalLink,
  generateCanonicalUrl,
} from '~/features/seo/canonical-url'
import { generateAreaCategoryMetaDescription } from '~/features/seo/meta-area-category'
import type { Route } from './+types/route'
import { listLocalizedPlaces } from './queries.server'

export const headers: Route.HeadersFunction = () => ({
  // Development: short cache for content updates
  // Production: cache for 4 hours with stale-while-revalidate
  'Cache-Control':
    process.env.NODE_ENV === 'production'
      ? 'public, max-age=14400, s-maxage=14400, stale-while-revalidate=86400'
      : 'public, max-age=0, must-revalidate',
})

export const meta: Route.MetaFunction = ({ data, location }) => {
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
        url: generateCanonicalUrl(
          `${data.lang.path}area/${data.area.areaId}/${data.category.id}/${data.rankingType}`,
        ),
      },
    },
  ]
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { city, lang, area, category, rankingType } = getPathParams(
    request,
    params,
    { require: { area: true, category: true, rank: true } },
  )

  const places = await listLocalizedPlaces({
    cityId: city.cityId,
    areaId: area.areaId,
    categoryId: category.id,
    language: lang.id,
    rankingType: rankingType ?? 'rating',
  })

  return { url: request.url, places, city, area, category, lang, rankingType }
}

export default function CategoryIndexPage({
  loaderData: { places, area, category, lang, rankingType },
}: Route.ComponentProps) {
  return (
    <Stack className="gap-2">
      <Tabs value={rankingType}>
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
          <TabsTrigger value="nearme" asChild>
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
          to={`${href('/:lang?/place/:place', { lang: lang.id !== 'en' ? lang.id : undefined, place: place.placeId })}?area=${area.areaId}&category=${category.id}&rank=${rankingType}`}
        />
      ))}
    </Stack>
  )
}
