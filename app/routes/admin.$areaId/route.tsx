import { parseWithZod } from '@conform-to/zod'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
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
import { Rating } from './components/rating'
import { NearbyForm } from './forms/nearby-form'
import { TextQueryForm } from './forms/text-query-form'
import { getArea } from './functions/get-area-id'
import { nearBySearch, textSearch } from './functions/places'
import { schema } from './schema'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAdminUser(request)
  const area = getArea(params)

  const searchParams = new URL(request.url).searchParams
  if (!searchParams.has('intent')) {
    return {
      places: null,
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
      intent: submission.value.intent,
      area,
      lastResult: submission.reply(),
    }
  }
}

export default function Index() {
  const { places, intent, area } = useLoaderData<typeof loader>()

  return (
    <Stack className="p-4 leading-8">
      <Card>
        <CardHeader>
          <CardTitle>{area.name}</CardTitle>
          <HStack className="text-sm text-muted-foreground">
            <p>{area.latitude}</p>
            <p>{area.longitude}</p>
            <a
              className="text-primary hover:underline"
              target="_blank"
              rel="noreferrer"
              href={`https://www.google.com/maps/@${area.latitude},${area.longitude},16z`}
            >
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

      {places && <div>found {places.length} places.</div>}

      {places?.map((place) => {
        return (
          <Card key={place.id}>
            <CardHeader>
              <CardTitle>
                {place.displayName.text}{' '}
                <Rating star={place.rating} withLabel />
              </CardTitle>
              <CardDescription>
                {place.userRatingCount} reviews{' | '}
                <a
                  className="hover:underline"
                  href={place.googleMapsUri}
                  target="_blank"
                  rel="noreferrer"
                >
                  Map
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-auto">
              <p>{place.editorialSummary?.text}</p>
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
