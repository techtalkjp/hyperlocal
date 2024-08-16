import { parseWithZod } from '@conform-to/zod'
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { MapIcon } from 'lucide-react'
import { z } from 'zod'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  HStack,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/components/ui'
import { requireAdminUser } from '~/services/auth.server'
import type { PlaceTypes } from '~/services/google-places'
import { Rating, ReviewText } from './components'
import { NearbyForm } from './forms/nearby-form'
import { TextQueryForm } from './forms/text-query-form'
import { nearBySearch, textSearch } from './functions/places'
import { addGooglePlace } from './mutations.server'
import { getArea, listAreaGooglePlaces } from './queries.server'
import { schema } from './schema'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: `Admin - ${data?.area.name}`,
  },
]

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAdminUser(request)
  const area = await getArea(params.areaId)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const areaGooglePlaces = await listAreaGooglePlaces(area.id)

  const searchParams = new URL(request.url).searchParams
  if (!searchParams.has('intent')) {
    return {
      places: null,
      areaGooglePlaces,
      intent: null,
      area,
      lastResult: null,
    }
  }

  const submission = parseWithZod(searchParams, { schema })
  if (submission.status !== 'success') {
    throw new Error('Invalid submission')
  }
  if (submission.value.intent === 'nearby') {
    const res = await nearBySearch({
      latitude: area.latitude,
      longitude: area.longitude,
      radius: submission.value.radius,
      includedPrimaryTypes: [submission.value.primaryType as PlaceTypes],
    })
    return {
      places: res.places,
      areaGooglePlaces,
      intent: submission.value.intent,
      area,
      lastResult: submission.reply(),
    }
  }

  if (submission.value.intent === 'textQuery') {
    const res = await textSearch({
      textQuery: submission.value.query,
      latitude: area.latitude,
      longitude: area.longitude,
      radius: 160.0,
      minRating: submission.value.minRating,
      // includedType: 'cafe',
    })
    return {
      places: res.places,
      areaGooglePlaces,
      intent: submission.value.intent,
      area,
      lastResult: submission.reply(),
    }
  }
}

const addSchema = z.object({
  intent: z.literal('add'),
  place: z.string(),
})

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await requireAdminUser(request)
  const areaId = params.areaId
  if (!areaId) {
    throw new Response('Not Found', { status: 404 })
  }

  const submission = parseWithZod(await request.formData(), {
    schema: addSchema,
  })
  if (submission.status !== 'success') {
    return { lastResult: submission.reply(), place: null }
  }

  const place = await addGooglePlace(areaId, submission.value.place)
  return { lastResult: submission.reply(), place }
}

export default function Index() {
  const { areaGooglePlaces, places, intent, area } =
    useLoaderData<typeof loader>()
  const addFetcher = useFetcher<typeof action>()

  return (
    <Stack className="p-4 leading-8">
      <Card>
        <CardHeader>
          <CardTitle>{area.name}</CardTitle>
          <HStack className="text-sm text-muted-foreground">
            <p>{area.latitude}</p>
            <p>{area.longitude}</p>
            <a
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
              target="_blank"
              rel="noreferrer"
              href={`https://www.google.com/maps/@${area.latitude},${area.longitude},16z`}
            >
              <MapIcon size="14" className="mr-1 inline" />
              Map
            </a>
          </HStack>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={intent ?? 'nearby'}>
            <TabsList>
              <TabsTrigger value="nearby">Near By</TabsTrigger>
              <TabsTrigger value="textQuery">Text Query</TabsTrigger>
            </TabsList>
            <TabsContent value="nearby">
              <NearbyForm />
            </TabsContent>

            <TabsContent value="textQuery">
              <TextQueryForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <HStack>
        <Stack>
          {areaGooglePlaces && (
            <div>found {areaGooglePlaces.length} places.</div>
          )}

          {areaGooglePlaces?.map((place) => {
            return (
              <Card key={place.id}>
                <CardHeader>
                  <CardTitle>{place.displayName}</CardTitle>
                  <HStack>
                    {place.rating && <Rating star={place.rating} withLabel />}
                    {place.userRatingCount ?? 0} reviews
                  </HStack>
                  <CardDescription>{place.primaryType}</CardDescription>
                </CardHeader>
                <CardContent> </CardContent>
              </Card>
            )
          })}
        </Stack>

        <Stack>
          {places && <div>found {places.length} places.</div>}

          {places?.map((place) => {
            return (
              <Card key={place.id}>
                <CardHeader>
                  <HStack>
                    <CardTitle>{place.displayName.text}</CardTitle>
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

                    <addFetcher.Form method="POST">
                      <input
                        type="hidden"
                        name="place"
                        value={JSON.stringify(place)}
                      />
                      <Button
                        type="submit"
                        name="intent"
                        value="add"
                        variant="outline"
                      >
                        Add
                      </Button>
                    </addFetcher.Form>
                  </HStack>
                  <HStack>
                    <Rating star={place.rating} withLabel />
                    {place.userRatingCount} reviews
                  </HStack>
                  <CardDescription>
                    {place.primaryTypeDisplayName?.text}
                    <br />
                    {place.editorialSummary?.text}
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-auto">
                  {place.reviews.map((review) => {
                    return (
                      <div
                        key={review.originalText.text}
                        className="border-b border-gray-200"
                      >
                        <Rating size={12} star={review.rating} withLabel />
                        <ReviewText className="text-xs">
                          {review.originalText.text}
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
      </HStack>
    </Stack>
  )
}
