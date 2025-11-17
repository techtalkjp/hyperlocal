import { areas, categories, scenes } from '@hyperlocal/consts'
import type { HeadersFunction } from 'react-router'
import { Link } from 'react-router'
import { Badge, Card, CardHeader, CardTitle, Stack } from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'
import { generateAlternateLinks } from '~/features/seo/alternate-links'
import { generateCanonicalLink } from '~/features/seo/canonical-url'
import { sortAreasByDistance } from '~/services/distance'
import type { Route } from './+types/route'
import { getPublishedArticlesForArea } from './queries.server'

export const headers: HeadersFunction = () => ({
  // Development: short cache for content updates
  // Production: cache for 4 hours with stale-while-revalidate
  'Cache-Control':
    process.env.NODE_ENV === 'production'
      ? 'public, max-age=14400, s-maxage=14400, stale-while-revalidate=86400'
      : 'public, max-age=0, must-revalidate',
})

export const meta: Route.MetaFunction = ({ data, location }) => {
  if (!data || !data.url) return []
  return [
    {
      title: `${data?.area.i18n[data.lang.id]} - Hyperlocal Tokyo`,
    },
    {
      name: 'description',
      content: `${data.area.description[data.lang.id]} Discover top-rated cafes, restaurants, and local spots in ${data.area.i18n[data.lang.id]}.`,
    },
    generateCanonicalLink(location.pathname),
    ...generateAlternateLinks({
      url: data.url,
      areaId: data.area.areaId,
    }),
  ]
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { lang, city, area } = await getPathParams(request, params, {
    require: { area: true },
  })

  const nearbyAreas = sortAreasByDistance(areas, area.latitude, area.longitude)
    .slice(0, 4)
    .filter((a) => a.distance < 3000)
    .filter((a) => a.areaId !== area.areaId)

  // Get published articles for this area
  const articles = await getPublishedArticlesForArea(
    city.cityId,
    area.areaId,
    lang.id,
  )

  return { url: request.url, lang, area, nearbyAreas, articles }
}

export default function AreaIndexPage({
  loaderData: { lang, area, nearbyAreas, articles },
}: Route.ComponentProps) {
  return (
    <Stack>
      <div className="mx-auto my-8 gap-8">
        <Stack>
          <h3
            className="text-center text-4xl leading-none font-semibold tracking-tight"
            style={{ viewTransitionName: `area-title-${area.areaId}` }}
          >
            {area.i18n[lang.id]}
          </h3>
          <div className="text-center">
            <Badge variant="secondary">Area</Badge>
          </div>
        </Stack>

        <p
          className="text-muted-foreground mx-2 mt-8 max-w-96 text-sm"
          style={{ viewTransitionName: `area-description-${area.areaId}` }}
        >
          {area.description[lang.id]}
        </p>
      </div>

      {/* Area Guides */}
      {articles.length > 0 && (
        <div>
          <h4 className="font-semibold">Area Guides</h4>
          <div className="grid gap-2">
            {articles.map((article) => {
              const scene = scenes.find((s) => s.id === article.sceneId)
              return (
                <Link
                  to={`guide/${article.sceneId}`}
                  key={article.sceneId}
                  prefetch="viewport"
                  viewTransition
                >
                  <Card className="hover:bg-secondary">
                    <CardHeader>
                      <CardTitle className="text-base">
                        {article.title}
                      </CardTitle>
                      {scene && (
                        <p className="text-muted-foreground text-sm">
                          {scene.description[lang.id]}
                        </p>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-semibold">Places</h4>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <Link
              to={`${category.id}/rating`}
              key={category.id}
              prefetch="viewport"
              viewTransition
            >
              <Card className="hover:bg-secondary">
                <CardHeader>
                  <CardTitle
                    style={{
                      viewTransitionName: `nav-category-${category.id}`,
                    }}
                  >
                    {category.i18n[lang.id]}
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Nearby Areas */}
      {nearbyAreas.length > 0 && (
        <div className="mt-8">
          <h4 className="font-semibold">Nearby Areas</h4>
          <div className="grid gap-1">
            {nearbyAreas.map((area) => (
              <Link
                to={`../${area.areaId}`}
                relative="path"
                key={area.areaId}
                viewTransition
              >
                <div className="hover:bg-secondary flex rounded-md border p-2">
                  <div className="flex-1">
                    <div
                      className="font-semibold"
                      style={{
                        viewTransitionName: `area-title-${area.areaId}`,
                      }}
                    >
                      {area.i18n[lang.id]}
                    </div>
                    <div
                      className="text-muted-foreground text-xs"
                      style={{
                        viewTransitionName: `area-description-${area.areaId}`,
                      }}
                    >
                      {area.description[lang.id]}
                    </div>
                  </div>
                  <div>
                    <Badge variant="secondary">Area</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Stack>
  )
}
