import { languages } from '@hyperlocal/consts'
import type {
  GooglePlacePhoto,
  GooglePlaceReview,
} from '@hyperlocal/google-place-api'
import type { LoaderFunctionArgs } from 'react-router'
import { Link, useLoaderData } from 'react-router'
import { z } from 'zod'
import { zx } from 'zodix'
import { HStack, Stack, Tabs, TabsList, TabsTrigger } from '~/components/ui'
import { requireAdminUser } from '~/features/auth/services/user-session.server'
import { PlaceCard, Rating } from '~/features/place/components'
import { getPlace } from './queries.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAdminUser(request)

  const {
    city: cityId,
    area: areaId,
    category: categoryId,
    language: languageId,
  } = zx.parseQuery(request, {
    city: z.string().optional(),
    area: z.string().optional().default('tokyo'),
    category: z.string().optional(),
    language: z.string().optional().default('en'),
  })
  const { place: placeId } = params
  if (!placeId) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const place = await getPlace(placeId)
  if (!place) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const lang = languages.find((lang) => lang.id === languageId)

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
          {photos.map((photo) => (
            <img
              key={photo.name}
              className="h-32 w-32 rounded object-cover"
              src={photo.name}
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
      </Stack>
    </div>
  )
}
