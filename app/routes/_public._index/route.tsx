import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import areas from '~/assets/areas.json'
import { Card, CardHeader, CardTitle, Stack } from '~/components/ui'

export const loader = ({ request, params }: LoaderFunctionArgs) => {
  return { areas }
}

export default function IndexPage() {
  const { areas } = useLoaderData<typeof loader>()
  return (
    <Stack className="px-2">
      {areas.map((area) => (
        <Link key={area.areaId} to={`/${area.areaId}`} prefetch="intent">
          <Card>
            <CardHeader>
              <CardTitle>{area.name}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </Stack>
  )
}
