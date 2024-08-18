import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { MessageSquareIcon } from 'lucide-react'
import { Rating } from '~/components/rating'
import { HStack, Stack } from '~/components/ui'
import type { Place } from '~/services/google-places'
import { getArea, listAreaGooglePlaces } from './queries.server'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: `${data?.area.name} - Hyperlocal`,
  },
]

export const handle = {
  breadcrumb: (data: Awaited<ReturnType<typeof loader>>) => (
    <div>{data.area.name}</div>
  ),
  area: (data: Awaited<ReturnType<typeof loader>>) => data.area.name,
}

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
      {places.map((place, idx) => {
        const raw = place.raw as unknown as Place
        return (
          <HStack className="items-start gap-4 p-2" key={place.id}>
            <div className="h-32 w-32 flex-shrink-0">
              <img
                className="h-32 w-32 rounded object-cover transition-transform hover:scale-125"
                src={`/resources/photos/${raw.photos?.[0].name}.jpg`}
                loading="lazy"
                alt="photo1"
              />
            </div>
            <div className="leading-relaxed">
              <div className="font-bold">
                <a href={raw.googleMapsUri} target="_blank" rel="noreferrer">
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
                  "{raw.reviews?.[0].originalText.text}"
                </div>
              </HStack>
            </div>
          </HStack>
        )
      })}
    </Stack>
  )
}
