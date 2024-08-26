import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getCityAreaCategory } from '~/features/admin/city-area-category/get-city-area-category'
import { PlaceCard } from '~/features/place/components'
import { requireAdminUser } from '~/services/auth.server'
import { getAreaGooglePlace } from './queries.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAdminUser(request)
  const { city, area, category } = getCityAreaCategory(params)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const { place: placeId } = params
  if (!placeId) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const place = await getAreaGooglePlace(placeId)
  if (!place) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  return {
    place,
  }
}

export default function PlacePage() {
  const { place } = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2 gap-4">
      <PlaceCard place={place} />
    </div>
  )
}
