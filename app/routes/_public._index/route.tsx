import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Card, CardHeader, CardTitle, Stack } from '~/components/ui'
import { listAreas } from './queries.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const areas = await listAreas()
  return { areas }
}

export default function IndexPage() {
  const { areas } = useLoaderData<typeof loader>()
  return (
    <Stack className="px-2">
      {areas.map((area) => (
        <Link key={area.id} to={`/${area.id}`} prefetch="intent">
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
