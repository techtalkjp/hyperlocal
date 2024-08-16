import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getArea, listAreaGooglePlaces } from './queries.server'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: `${data?.area.name} - Hyperlocal`,
  },
]

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const area = await getArea(params.areaId)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const places = await listAreaGooglePlaces(area.id)

  return { area, places }
}

export default function AreaIndexPage() {
  const { area, places } = useLoaderData<typeof loader>()
  return (
    <div>
      {area.name}

      <div>
        {places.map((place) => (
          <div key={place.id}>
            {place.displayName} {place.rating}
          </div>
        ))}
      </div>
    </div>
  )
}
