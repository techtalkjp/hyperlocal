import { parseWithZod } from '@conform-to/zod'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
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
  SheetTitle,
  SheetTrigger,
  Stack,
} from '~/components/ui'
import { getCityAreaCategory } from '~/features/admin/city-area-category/get-city-area-category'
import { PlaceCard, Rating } from '~/features/place/components'
import { requireAdminUser } from '~/services/auth.server'
import type { PlaceType } from '~/services/google-places'
import { registerAreaGooglePlacesCategoryTask } from '~/trigger/register-area-google-places-category'
import { nearBySearch } from '../../services/google-places'
import { LLMTest, ReviewText } from './components'
import { NearbyForm } from './forms/nearby-form'
import { addGooglePlace } from './functions/mutations.server'
import { listAreaGooglePlaces } from './functions/queries.server'
import { schema } from './schema'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAdminUser(request)
  const { city, area, category } = getCityAreaCategory(params)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const areaGooglePlaces = await listAreaGooglePlaces(area.areaId, category.id)

  const searchParams = new URL(request.url).searchParams
  if (!searchParams.has('intent')) {
    return {
      city,
      area,
      category,
      places: null,
      areaGooglePlaces,
      intent: null,
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
      includedPrimaryTypes: category?.googlePlaceTypes as PlaceType[],
    })
    return {
      city,
      area,
      category,
      places: res.places.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)),
      areaGooglePlaces,
      intent: submission.value.intent,
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
  const { city, area, category } = getCityAreaCategory(params)
  if (!city) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const submission = parseWithZod(await request.formData(), {
    schema: addSchema,
  })
  if (submission.status !== 'success') {
    return { lastResult: submission.reply(), place: null }
  }

  if (submission.value.intent === 'register') {
    const handle = await registerAreaGooglePlacesCategoryTask.trigger({
      cityId: area.cityId,
      areaId: area.areaId,
      radius: area.radius,
      categoryId: category.id,
    })

    return jsonWithSuccess(
      { handle },
      {
        message: 'Task triggered',
        description: `Triggered ${categories.length} tasks: ${city.name} ${area.areaId}, ${category.names.en}, ${area.radius}m`,
      },
    )
  }

  if (submission.value.intent === 'add') {
    const place = await addGooglePlace(
      area.cityId,
      area.areaId,
      category.id,
      submission.value.place,
    )
    return { lastResult: submission.reply(), place }
  }
}

export default function Index() {
  const { city, area, category, areaGooglePlaces, places } =
    useLoaderData<typeof loader>()
  const addFetcher = useFetcher<typeof action>()
  const registerFetcher = useFetcher<typeof action>()

  return (
    <Stack>
      <NearbyForm categoryId={category.id} radius={area.radius} />

      <HStack>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" type="button">
              Show Registered Places
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-auto">
            <SheetHeader>
              <SheetTitle>Registered Places</SheetTitle>
              <SheetDescription>
                {areaGooglePlaces.length} places.
              </SheetDescription>
            </SheetHeader>

            <Stack>
              {areaGooglePlaces?.map((place, idx) => {
                return (
                  <HStack key={`${place.categoryId}-${place.id}`}>
                    <LLMTest place={place} />
                    <PlaceCard place={place} no={idx + 1} />
                  </HStack>
                )
              })}
            </Stack>
          </SheetContent>
        </Sheet>

        <registerFetcher.Form method="POST">
          <Button
            type="submit"
            name="intent"
            isLoading={registerFetcher.state === 'submitting'}
            value="register"
          >
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
                      <input
                        type="hidden"
                        name="categoryId"
                        value={category?.id}
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
