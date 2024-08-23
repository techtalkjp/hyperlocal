import { parseWithZod } from '@conform-to/zod'
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { MapIcon } from 'lucide-react'
import { jsonWithSuccess } from 'remix-toast'
import { z } from 'zod'
import categories from '~/assets/categories.json'
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
  Stack,
} from '~/components/ui'
import { PlaceCard } from '~/features/place/components'
import { requireAdminUser } from '~/services/auth.server'
import type { Place, PlaceType } from '~/services/google-places'
import { registerAreaGooglePlacesCategoryTask } from '~/trigger/register-area-google-places-category'
import { nearBySearch } from '../../services/google-places'
import { Rating, ReviewText } from './components'
import { NearbyForm } from './forms/nearby-form'
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
    const category = categories.find(
      (category) => category.id === submission.value.category,
    )
    const res = await nearBySearch({
      latitude: area.latitude,
      longitude: area.longitude,
      radius: submission.value.radius,
      includedPrimaryTypes: category?.googlePlaceTypes as PlaceType[],
    })
    return {
      places: res.places.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)),
      areaGooglePlaces,
      intent: submission.value.intent,
      area,
      lastResult: submission.reply(),
    }
  }
}

const addSchema = z.discriminatedUnion('intent', [
  z.object({
    intent: z.literal('add'),
    place: z.string(),
  }),
  z.object({
    intent: z.literal('register'),
  }),
])

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

  if (submission.value.intent === 'register') {
    const radius = 400
    const handle = await registerAreaGooglePlacesCategoryTask.batchTrigger(
      categories.map((category) => ({
        payload: {
          areaId,
          radius,
          categoryId: category.id,
        },
      })),
    )

    return jsonWithSuccess(
      { handle },
      {
        message: 'Task triggered',
        description: `Triggered ${categories.length} tasks: ${areaId}, ${radius}m`,
      },
    )
  }

  if (submission.value.intent === 'add') {
    const place = await addGooglePlace(areaId, 'cafe', submission.value.place)
    return { lastResult: submission.reply(), place }
  }
}

export default function Index() {
  const { areaGooglePlaces, places, intent, area } =
    useLoaderData<typeof loader>()
  const addFetcher = useFetcher<typeof action>()
  const registerFetcher = useFetcher<typeof action>()

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
          <NearbyForm />
        </CardContent>
      </Card>

      <HStack>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" type="button">
              Show Registered Places
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-auto">
            <SheetHeader>Registered Places</SheetHeader>
            <SheetDescription>
              Places that are already registered in the system.
            </SheetDescription>

            <Stack>
              {areaGooglePlaces && (
                <div>found {areaGooglePlaces.length} places.</div>
              )}

              {areaGooglePlaces?.map((place, idx) => {
                return (
                  <PlaceCard
                    key={place.id}
                    place={place.raw as unknown as Place}
                    no={idx + 1}
                  />
                )
              })}
            </Stack>
          </SheetContent>
        </Sheet>

        <registerFetcher.Form method="POST">
          <Button type="submit" name="intent" value="register">
            Register
          </Button>
        </registerFetcher.Form>
      </HStack>

      {places && (
        <Stack>
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
                  <HStack>
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
      )}
    </Stack>
  )
}
