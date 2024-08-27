import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { Button, Stack } from '~/components/ui'
import { getCityAreaCategory } from '~/features/admin/city-area-category/get-city-area-category'
import { Rating } from '~/features/place/components'
import { requireAdminUser } from '~/services/auth.server'
import { getAreaGooglePlace } from '../admin.$city.$area.$category.$place/queries.server'
import { translatePlace } from './translate-place'

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
  const { city, area } = getCityAreaCategory(params)

  const placeId = params.place
  if (!placeId) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const place = await getAreaGooglePlace(placeId)
  if (!place) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const lang = params.lang
  if (!lang) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const translated = await translatePlace(place, city.language, lang)

  return { translated }
}

export default function PlacePage() {
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
