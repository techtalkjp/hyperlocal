import { LanguageIdSchema, languages } from '@hyperlocal/consts'
import { Link, redirect } from 'react-router'
import { z } from 'zod'
import { zx } from 'zodix'
import { HStack, Stack, Tabs, TabsList, TabsTrigger } from '~/components/ui'
import { PlaceCard, Rating } from '~/features/place/components'
import { requireAdminUser } from '~/services/auth.server'
import type { Route } from './+types/route'
import { getLocalizedPlace, getPlace } from './queries.server'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  await requireAdminUser(request)

  const { place: placeId, lang: languageId } = zx.parseParams(params, {
    place: z.string(),
    lang: LanguageIdSchema.optional(),
  })
  if (!placeId) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!languageId) {
    throw redirect('en')
  }

  const place = await getPlace(placeId)
  if (!place) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const localizedPlace = await getLocalizedPlace(placeId, languageId)

  return {
    place,
    languageId,
    localizedPlace,
  }
}

export default function AdminPlaceLayout({
  loaderData: { place, languageId, localizedPlace },
}: Route.ComponentProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Stack>
        <PlaceCard place={place} />

        <HStack className="overflow-auto">
          {place.photos.map((photo) => (
            <img
              key={photo}
              className="h-32 w-32 rounded object-cover"
              src={photo}
              loading="lazy"
              alt="photo1"
            />
          ))}
        </HStack>

        <Stack>
          {place.reviews.map((review, idx) => (
            <div key={`${idx}-${review.originalText?.text}`}>
              <Rating
                star={review.rating}
                size={14}
                withLabel
                className="shrink-0"
              />
              <div>{review.originalText?.text}</div>
            </div>
          ))}
        </Stack>
      </Stack>

      <Stack>
        <Tabs defaultValue={languageId}>
          <TabsList>
            {languages.map((lang) => (
              <TabsTrigger key={lang.id} value={lang.id} asChild>
                <Link to={`../${lang.id}`} relative="path">
                  {lang.displayName}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div>{JSON.stringify(localizedPlace)}</div>
      </Stack>
    </div>
  )
}
