import { parseWithZod } from '@conform-to/zod'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { MapIcon } from 'lucide-react'
import areas from '~/assets/areas.json'
import categories from '~/assets/categories.json'
import cities from '~/assets/cities.json'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  HStack,
  Stack,
} from '~/components/ui'
import { Rating } from '~/features/place/components'
import { requireAdminUser } from '~/services/auth.server'
import { type PlaceType, nearBySearch } from '~/services/google-places'
import { ReviewText } from './components/review'
import { NearbyForm } from './forms/nearby-form'
import { schema } from './schema'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdminUser(request)

  const searchParams = new URL(request.url).searchParams
  const submission = parseWithZod(searchParams, { schema })
  if (submission.status !== 'success') {
    throw new Error('Invalid submission')
  }

  const city = cities.find((city) => city.cityId === submission.value.cityId)
  if (!city) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const area = areas.find((area) => area.areaId === submission.value.areaId)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const category = categories.find(
    (category) => category.id === submission.value.categoryId,
  )
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const res = await nearBySearch({
    latitude: area.latitude,
    longitude: area.longitude,
    radius: submission.value.radius,
    includedPrimaryTypes: category.googlePlaceTypes as PlaceType[],
  })
  return {
    city,
    area,
    category,
    places: res.places.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)),
    lastResult: submission.reply(),
  }
}

export const NearbyPlaceList = ({
  cityId,
  areaId,
  categoryId,
}: {
  cityId: string
  areaId: string
  categoryId: string
}) => {
  const fetcher = useFetcher<typeof loader>()
  const places = fetcher.data?.places ?? []

  return (
    <Stack>
      <NearbyForm
        fetcher={fetcher}
        cityId={cityId}
        areaId={areaId}
        categoryId={categoryId}
      />
      <div>found {places.length} places.</div>
      {places.map((place, idx) => {
        return (
          <Card key={place.id}>
            <CardHeader>
              <HStack>
                <CardTitle>
                  {idx + 1}. {place.displayName.text}
                </CardTitle>
                <div className="text-muted-foreground hover:text-foreground">
                  <a
                    className="text-xs hover:underline"
                    href={place.googleMapsUri}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MapIcon size="14" className="mr-1 inline" />
                    Map
                  </a>
                </div>
                <div className="flex-1" />
              </HStack>
              <HStack>
                <Rating star={place.rating} withLabel />
                {place.userRatingCount} reviews
              </HStack>
              <HStack className="overflow-auto">
                {place.types.map((type) => (
                  <Badge key={type}>{type}</Badge>
                ))}
              </HStack>
            </CardHeader>
            <CardContent className="overflow-auto">
              {place.reviews?.map((review, idx) => {
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <div key={idx} className="border-b border-gray-200">
                    <Rating size={12} star={review.rating} withLabel />
                    <ReviewText className="text-xs">
                      {review.originalText?.text}
                    </ReviewText>
                  </div>
                )
              })}

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    Details
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre>{JSON.stringify(place, null, 2)}</pre>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        )
      })}
    </Stack>
  )
}
