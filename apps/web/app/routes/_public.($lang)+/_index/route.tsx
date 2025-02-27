import { areas as allAreas, cities } from '@hyperlocal/consts'
import { Link } from 'react-router'
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  HStack,
  Stack,
} from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'
import { getCityDomain } from '~/features/city-area/utils/get-city-domain'
import { generateAlternateLinks } from '~/features/seo/alternate-links'
import type { Route } from './+types/route'

export const headers: Route.HeadersFunction = () => ({
  // cache for 30 days
  'Cache-Control':
    'public, max-age=14400, s-maxage=2592000, stale-while-revalidate=2592000',
})

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data || !data.url) return []
  return [
    {
      title: `Hyperlocal ${data?.city.i18n[data.lang.id]}`,
    },
    ...generateAlternateLinks({
      url: data.url,
    }),
  ]
}

export const loader = ({ request, params }: Route.LoaderArgs) => {
  const { city, lang } = getPathParams(request, params)
  const areas = allAreas.filter((area) => area.cityId === city.cityId)

  return { url: request.url, cities, city, areas, lang }
}

export default function IndexPage({
  loaderData: { areas, city, lang, url },
}: Route.ComponentProps) {
  return (
    <Stack>
      <HStack className="mx-auto my-8 gap-8">
        {cities.map((c) => (
          <Button
            key={c.cityId}
            variant={c.cityId === city.cityId ? 'default' : 'outline'}
            className="min-w-20"
            asChild
          >
            <a href={getCityDomain(url, c.cityId).href}>{c.i18n[lang.id]}</a>
          </Button>
        ))}
      </HStack>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {areas.map((area) => (
          <Link
            key={area.areaId}
            to={`area/${area.areaId}`}
            prefetch="viewport"
            viewTransition
          >
            <Card className="hover:bg-secondary h-full">
              <CardHeader className="h-full">
                <CardTitle
                  style={{ viewTransitionName: `area-title-${area.areaId}` }}
                >
                  {area.i18n[lang.id]}
                </CardTitle>
                <CardDescription
                  style={{
                    viewTransitionName: `area-description-${area.areaId}`,
                  }}
                >
                  {area.description[lang.id]}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </Stack>
  )
}
