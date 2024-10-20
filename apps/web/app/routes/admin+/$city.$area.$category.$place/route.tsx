import { languages } from '@hyperlocal/consts'
import type {
  GooglePlacePhoto,
  GooglePlaceReview,
} from '@hyperlocal/google-place-api'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { HStack, Stack, Tabs, TabsList, TabsTrigger } from '~/components/ui'
import { getCityAreaCategory } from '~/features/admin/city-area-category/get-city-area-category'
import { PlaceCard, Rating } from '~/features/place/components'
import { requireAdminUser } from '~/services/auth.server'
import { getPlace } from './queries.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAdminUser(request)
  const { lang, city, area, category } = getCityAreaCategory(params)
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
  const place = await getPlace(placeId)
  if (!place) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  return {
    place,
    lang,
  }
}

export default function AdminPlaceLayout() {
  const { place, lang } = useLoaderData<typeof loader>()
  const photos = place.photos as unknown as GooglePlacePhoto[]
  const reviews = place.reviews as unknown as GooglePlaceReview[]

  return (
    <div className="grid grid-cols-2 gap-4">
      <Stack>
        <PlaceCard place={place} />

        <HStack className="overflow-auto">
          {photos.slice(1).map((photo) => (
            <img
              key={photo.name}
              className="h-32 w-32 rounded object-cover"
              src={`/resources/photos/${photo.name}.jpg`}
              loading="lazy"
              alt="photo1"
            />
          ))}
        </HStack>

        <Stack>
          {reviews.map((review, idx) => (
            <div key={`${idx}-${review.originalText?.text}`}>
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
