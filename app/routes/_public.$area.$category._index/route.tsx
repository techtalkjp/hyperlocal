import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Stack } from '~/components/ui'
import { getCityAreaCategory } from '~/features/admin/city-area-category/get-city-area-category'
import { LocalizedPlaceCard } from '~/features/place/components/localized-place-card'
import { listLocalizedPlaces } from './queries.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { city, area, lang, category } = getCityAreaCategory(params)
  console.log({ city, area, lang, category })
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  // if (!lang) {
  //   throw new Response(null, { status: 404, statusText: 'Not Found' })
  // }

  const places = await listLocalizedPlaces(
    city.cityId,
    area.areaId,
    category.id,
    'en', // lang.id,
  )
  return { places }
}

export default function AreaIndexPage() {
  const { places } = useLoaderData<typeof loader>()
  console.log(places)
  return (
    <Stack className="p-2">
      {places.length === 0 && (
        <div className="text-sm text-muted-foreground">No Places</div>
      )}
      {places.map((place, idx) => (
        <LocalizedPlaceCard key={place.placeId} place={place} no={idx + 1} />
      ))}
    </Stack>
  )
}
