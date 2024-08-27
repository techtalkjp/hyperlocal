import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Stack } from '~/components/ui'
import { getLangCityAreaCategory } from '~/features/city-area/utils'
import { LocalizedPlaceCard } from '~/features/place/components/localized-place-card'
import { listLocalizedPlaces } from './queries.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { city, area, lang, category } = getLangCityAreaCategory(
    request,
    params,
  )
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!lang) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const places = await listLocalizedPlaces(
    city.cityId,
    area.areaId,
    category.id,
    lang.id,
  )

  return { places }
}

export default function AreaIndexPage() {
  const { places } = useLoaderData<typeof loader>()

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
