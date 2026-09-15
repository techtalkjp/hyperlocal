import { AlertCircle, LoaderIcon, XCircle } from 'lucide-react'
import {
  type ClientLoaderFunctionArgs,
  href,
  NavLink,
  useLoaderData,
} from 'react-router'
import { match } from 'ts-pattern'
import { Button, Stack, Tabs, TabsList, TabsTrigger } from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'
import { LocalizedPlaceCard } from '~/features/place/components/localized-place-card'
import { generateAlternateLinks } from '~/features/seo/alternate-links'
import { generateCanonicalLink } from '~/features/seo/canonical-url'
import { generateAreaCategoryMetaDescription } from '~/features/seo/meta-area-category'
import { sortLocalizedPlaceByDistance } from '~/services/distance'
import { listLocalizedPlaces } from './+queries.server'
import type { Route } from './+types/route'

export const headers: Route.HeadersFunction = () => ({
  // Browser caches briefly; edge keeps a day with background revalidation.
  // NOTE: s-maxage/must-revalidate would disable stale-while-revalidate,
  // so edge directives live in cloudflare-cdn-cache-control instead.
  'Cache-Control': 'public, max-age=60, stale-while-revalidate=60',
  'cloudflare-cdn-cache-control':
    'public, max-age=86400, stale-while-revalidate=3600',
  'Cache-Tag': 'area',
})

export const meta = ({ loaderData, location }: Route.MetaArgs) => {
  // SSR時はclientLoader未実行でloaderDataが空のため早期リターンしていたが、
  // それではnoindexも出力されず空headのまま200を返す。
  // 個別化ページは検索対象外なので、最低限noindexだけは常に出す。
  if (!loaderData?.url)
    return [{ name: 'robots', content: 'noindex, follow' }]

  const rankingTitle = match(loaderData.rankingType)
    .with('review', () => 'Most Popular')
    .with('rating', () => 'Top Rated')
    .with('nearme', () => 'Near Me')
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
    // 位置情報で並び替える個別化ページのため検索対象外とする。
    // SSR時はclientLoader未実行でtitle等が空になる問題もあり、
    // sitemapからも除外済み(scripts/sitemap/generate-rank.ts)。
    { name: 'robots', content: 'noindex, follow' },
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
        url: new URL(
          `${loaderData.lang.path}area/${loaderData.area.areaId}/${loaderData.category.id}/${loaderData.rankingType}`,
          loaderData.url,
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

  // 位置情報取得を10秒でタイムアウト
  const position = await Promise.race([
    new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        maximumAge: 300000, // 5分間はキャッシュを使用
        enableHighAccuracy: false, // 高精度は不要（速度優先）
      })
    }),
    new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 10000),
    ),
  ]).catch((e) => {
    console.log('Geolocation error:', e)
    return null
  })

  // 位置情報が取得できない場合は、rating順でソート
  if (!position) {
    return { places, ...loaderResponses, position: null }
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
  const { places, area, category, lang, position } =
    useLoaderData<typeof clientLoader>()

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

      {!position && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>
            Unable to get your location. Showing places sorted by rating
            instead.
          </p>
        </div>
      )}

      {places.length === 0 && (
        <div className="text-muted-foreground text-sm">No Places</div>
      )}
      {places.map((place, idx) => (
        <LocalizedPlaceCard
          key={place.placeId}
          place={place}
          distance={'distance' in place ? place.distance : undefined}
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
    <Stack className="gap-4">
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

      <div className="bg-muted/50 flex items-center justify-between rounded-md border p-4">
        <div className="flex items-center gap-3">
          <LoaderIcon className="h-5 w-5 animate-spin text-blue-500" />
          <div className="text-sm">
            <div className="font-medium">Getting your location...</div>
            <div className="text-muted-foreground text-xs">
              This may take a few seconds
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <NavLink to={'../rating'} viewTransition>
            <XCircle className="mr-2 h-4 w-4" />
            Cancel
          </NavLink>
        </Button>
      </div>
    </Stack>
  )
}
