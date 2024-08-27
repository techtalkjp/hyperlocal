import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Card, CardHeader, CardTitle, Stack } from '~/components/ui'
import areas from '~/consts/areas'
import { getLangCityAreaCategory } from '~/features/city-area/utils'

export const loader = ({ request, params }: LoaderFunctionArgs) => {
  const { city, lang } = getLangCityAreaCategory(request, params)
  return { areas, city, lang }
}

export default function IndexPage() {
  const { areas, city, lang } = useLoaderData<typeof loader>()
  return (
    <Stack className="px-2">
      {areas.map((area) => (
        <Link
          key={area.areaId}
          to={`${lang.path}/place/${area.areaId}`}
          prefetch="intent"
        >
          <Card>
            <CardHeader>
              <CardTitle>{area.i18n[lang.id]}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </Stack>
  )
}
