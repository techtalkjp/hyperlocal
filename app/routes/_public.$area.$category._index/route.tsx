import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Stack } from '~/components/ui'
import { PlaceCard } from '~/features/place/components/place-card'
import type { Place } from '~/services/google-places'
import { listAreaGooglePlaces } from './queries.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const areaId = params.area
  if (!areaId) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const categoryId = params.category
  if (!categoryId) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const places = await listAreaGooglePlaces(areaId, categoryId)
  return { places }
}

export default function AreaIndexPage() {
  const { places } = useLoaderData<typeof loader>()
  return (
    <Stack className="p-2">
      {places.map((place, idx) => {
        return (
          <PlaceCard
            key={place.id}
            place={place.raw as unknown as Place}
            no={idx + 1}
          />
        )
      })}
    </Stack>
  )
}
