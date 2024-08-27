import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import languages from '~/assets/languages.json'
import { Stack, Tabs, TabsList, TabsTrigger } from '~/components/ui'
import { getCityAreaCategory } from '~/features/admin/city-area-category/get-city-area-category'
import { PlaceCard, Rating } from '~/features/place/components'
import { requireAdminUser } from '~/services/auth.server'
import { getAreaGooglePlace } from '../admin.$city.$area.$category.$place/queries.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAdminUser(request)
  const { city, area, category } = getCityAreaCategory(params)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const { place: placeId, lang: langId } = params
  if (!placeId) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const place = await getAreaGooglePlace(placeId)
  if (!place) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const lang = languages.find((l) => l.id === langId)

  return {
    place,
    lang,
  }
}

export default function PlacePage() {
  const { place, lang } = useLoaderData<typeof loader>()
  const reviews = place.reviews as unknown as {
    rating: number
    originalText?: { text: string }
  }[]

  return (
    <div className="grid grid-cols-2 gap-4">
      <Stack>
        <PlaceCard place={place} />

        <Stack>
          {reviews.map((review, idx) => (
            <div key={review.originalText?.text}>
              <Rating
                star={review.rating}
                size={14}
                withLabel
                className="flex-shrink-0"
              />
              <div>{review.originalText?.text}</div>
            </div>
          ))}
        </Stack>
      </Stack>

      <Stack>
        <Tabs defaultValue={lang?.id}>
          <TabsList>
            {languages.map((lang) => (
              <TabsTrigger key={lang.id} value={lang.id} asChild>
                <Link to={lang.id}>{lang.displayName}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Outlet />
      </Stack>
    </div>
  )
}
