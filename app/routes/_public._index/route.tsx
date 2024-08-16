import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { listAreas } from './queries.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const areas = await listAreas()
  return { areas }
}

export default function IndexPage() {
  const { areas } = useLoaderData<typeof loader>()
  return (
    <div>
      {areas.map((area) => (
        <div key={area.id}>
          <Link to={`/${area.id}`}>{area.name}</Link>
        </div>
      ))}
    </div>
  )
}
