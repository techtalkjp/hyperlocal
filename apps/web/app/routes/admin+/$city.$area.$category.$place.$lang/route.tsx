import { getPlacePhotoUri, type GooglePlacePhoto } from '@hyper-local/types'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import {
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useRouteError,
} from '@remix-run/react'
import { Button, HStack, Stack } from '~/components/ui'
import { getCityAreaCategory } from '~/features/admin/city-area-category/get-city-area-category'
import { upsertLocalizedPlace } from '~/features/localize/mutations.server'
import { translateGooglePlace } from '~/features/localize/translate-google-place'
import { Rating } from '~/features/place/components'
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

  return { placeId }
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await requireAdminUser(request)
  const { lang, city, area, category } = getCityAreaCategory(params)

  if (!lang) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const placeId = params.place
  if (!placeId) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const place = await getAreaGooglePlace(placeId)
  if (!place) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const translated = await translateGooglePlace(place, city.language, lang.id)
  const photos: string[] = []
  for (const photo of place.photos as unknown as GooglePlacePhoto[]) {
    photos.push(
      await getPlacePhotoUri({
        name: photo.name,
      }),
    )
  }

  await upsertLocalizedPlace({
    cityId: city.cityId,
    areaId: area.areaId,
    categoryId: category.id,
    languageId: lang.id,
    googlePlace: place,
    translated,
    photos,
  })

  return { translated, photos }
}

export default function AdminPlaceLangPage() {
  const { placeId } = useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof action>()

  return (
    <>
      <fetcher.Form method="POST">
        <input type="hidden" name="placeId" value={placeId} />
        <Button
          type="submit"
          variant="outline"
          isLoading={fetcher.state === 'submitting'}
        >
          Test Translate
        </Button>
      </fetcher.Form>

      {fetcher.data?.translated && (
        <div>
          <div className="font-bold">{fetcher.data.translated.displayName}</div>
          <div className="text-sm text-muted-foreground">
            {fetcher.data.translated.originalDisplayName}
          </div>

          {fetcher.data?.photos && (
            <HStack className="overflow-auto">
              {fetcher.data.photos.map((photo) => (
                <img
                  key={photo}
                  className="h-32 w-32 rounded object-cover"
                  src={photo}
                  loading="lazy"
                  alt="photo1"
                />
              ))}
            </HStack>
          )}

          <Stack>
            {fetcher.data.translated.reviews.map((review) => (
              <div key={review.text}>
                <Rating
                  star={review.rating}
                  size={14}
                  withLabel
                  className="flex-shrink-0"
                />
                <div>{review.text}</div>
              </div>
            ))}
          </Stack>
        </div>
      )}
    </>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    )
  }
  if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    )
  }
  return <h1>Unknown Error</h1>
}
