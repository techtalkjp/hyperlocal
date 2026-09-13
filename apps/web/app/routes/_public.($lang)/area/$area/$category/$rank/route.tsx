import { LoaderIcon } from 'lucide-react'
import { href, NavLink } from 'react-router'
import { match } from 'ts-pattern'
import { Stack, Tabs, TabsList, TabsTrigger } from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'
import { RouteErrorBoundary } from '~/features/error/components/route-error-boundary'
import { LocalizedPlaceCard } from '~/features/place/components/localized-place-card'
import { generateAlternateLinks } from '~/features/seo/alternate-links'
import {
  generateCanonicalLink,
  generateCanonicalUrl,
} from '~/features/seo/canonical-url'
import { generateAreaCategoryMetaDescription } from '~/features/seo/meta-area-category'
import { listLocalizedPlaces } from './+queries.server'
import type { Route } from './+types/route'

export const meta: Route.MetaFunction = ({ loaderData, location }) => {
  if (!loaderData?.url) return []

  const rankingTitle = match(loaderData.rankingType)
    .with('review', () => 'Most Popular')
    .with('rating', () => 'Top Rated')
    .otherwise(() => '')

  return [
    {
      title: `${rankingTitle} ${loaderData.area.i18n[loaderData.lang.id]} ${loaderData.category.i18n[loaderData.lang.id]} - Hyperlocal ${loaderData?.city.i18n[loaderData.lang.id]}`,
    },
    {
      name: 'description',
      content: generateAreaCategoryMetaDescription(
        loaderData.city.cityId,
        loaderData.area.areaId,
        loaderData.category.id,
        loaderData.lang.id,
      ),
    },
    generateCanonicalLink(location.pathname),
    ...generateAlternateLinks({
      url: loaderData.url,
      areaId: loaderData.area.areaId,
      categoryId: loaderData.category.id,
      rankingType: loaderData.rankingType,
    }),
    {
      'script:ld+json': {
        '@context': 'http://schema.org',
        '@type': 'LocalBusiness',
        name: `${loaderData.city.i18n[loaderData.lang.id]} ${loaderData.area.i18n[loaderData.lang.id]} ${loaderData.category.i18n[loaderData.lang.id]}`,
        description: generateAreaCategoryMetaDescription(
          loaderData.city.cityId,
          loaderData.area.areaId,
          loaderData.category.id,
          loaderData.lang.id,
        ),
        url: generateCanonicalUrl(
          `${loaderData.lang.path}area/${loaderData.area.areaId}/${loaderData.category.id}/${loaderData.rankingType}`,
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
              {({ isPending }: { isPending: boolean }) => (
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

export const ErrorBoundary = () => {
  // Note: languageId should ideally be extracted from route params/loader
  // For now, using 'en' as default. This could be improved by accessing route context
  return <RouteErrorBoundary languageId="en" />
}
