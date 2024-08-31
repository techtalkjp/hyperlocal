import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Stack } from '~/components/ui'
import { getLangCityAreaCategory } from '~/features/city-area/utils'
import { LocalizedPlaceCard } from '~/features/place/components/localized-place-card'
import { listLocalizedPlaces } from './queries.server'

export const headers: HeadersFunction = () => ({
  // cache for 30 days
  'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=2592000',
})

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

  return { places, city, lang }
}

export default function CategoryIndexPage() {
  const { places, city, lang } = useLoaderData<typeof loader>()

  return (
    <Stack>
      {places.length === 0 && (
        <div className="text-sm text-muted-foreground">No Places</div>
      )}
      {places.map((place, idx) => (
        <Link
          to={place.googleMapsUri}
          key={place.placeId}
          target="_blank"
          rel="noreferrer"
        >
          <LocalizedPlaceCard
            key={place.placeId}
            place={place}
            no={idx + 1}
            loading={idx <= 5 ? 'eager' : 'lazy'}
            withOriginalName={city.language !== lang.id}
          />
        </Link>
      ))}
    </Stack>
  )
}
