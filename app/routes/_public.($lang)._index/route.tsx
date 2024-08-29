import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  HStack,
  Stack,
} from '~/components/ui'
import allAreas from '~/consts/areas'
import cities from '~/consts/cities'
import { getLangCityAreaCategory } from '~/features/city-area/utils'
import { getCityDomain } from '~/features/city-area/utils/get-city-domain'

export const loader = ({ request, params }: LoaderFunctionArgs) => {
  const { city, lang } = getLangCityAreaCategory(request, params)
  const areas = allAreas.filter((area) => area.cityId === city.cityId)

  const url = new URL(request.url)
  return { cities, areas, city, lang, url }
}

export default function IndexPage() {
  const { areas, city, lang, url } = useLoaderData<typeof loader>()
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

      {areas.map((area) => (
        <Link key={area.areaId} to={`area/${area.areaId}`} prefetch="intent">
          <Card className="hover:bg-secondary">
            <CardHeader>
              <CardTitle>{area.i18n[lang.id]}</CardTitle>
              <CardDescription>{area.name}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </Stack>
  )
}
