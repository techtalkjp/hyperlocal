import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { MessageSquareIcon } from 'lucide-react'
import { Rating } from '~/components/rating'
import { HStack, Stack } from '~/components/ui'
import { getArea, listAreaGooglePlaces } from './queries.server'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: `${data?.area.name} - Hyperlocal`,
  },
]

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const area = await getArea(params.areaId)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const places = await listAreaGooglePlaces(area.id)

  return { area, places }
}

export default function AreaIndexPage() {
  const { area, places } = useLoaderData<typeof loader>()
  return (
    <Stack>
      <div>{area.name}</div>

      {places.map((place, idx) => {
        const photos = place.raw.photos
        return (
          <HStack className="items-start gap-4 p-2" key={place.id}>
            <img
              className="h-32 w-32 rounded object-cover transition-transform hover:scale-125"
              src={`/resources/photos/${photos?.[0].name}`}
              alt="photo1"
            />
            <div className="leading-relaxed">
              <div className="font-bold">
                <a
                  href={place.raw.googleMapsUri}
                  target="_blank"
                  rel="noreferrer"
                >
                  {idx + 1}. {place.displayName}
                </a>
              </div>
              <div className="text-xs text-foreground/70">
                {place.displayName}
              </div>

              <HStack>
                <Rating star={place.rating} withLabel={true} size={14} />
                <div className="text-xs text-muted-foreground">
                  {place.userRatingCount} reviews
                </div>
              </HStack>
              <HStack className="items-start">
                <MessageSquareIcon size="12" className="mt-0.5 flex-shrink-0" />
                <div className="line-clamp-2 text-xs text-muted-foreground">
                  "{place.raw.reviews?.[0].originalText.text}"
                </div>
              </HStack>
            </div>
          </HStack>
        )
      })}
    </Stack>
  )
}
