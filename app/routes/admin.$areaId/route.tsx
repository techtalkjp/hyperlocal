import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { zx } from 'zodix'
import areas from '~/assets/areas.json'
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
import { nearBySearch, textSearch } from './functions/places'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { areaId } = zx.parseParams(
    params,
    z.object({
      areaId: z.string(),
    }),
  )
  const area = areas.find((area) => area.id === areaId)
  if (!area) {
    throw new Response('Not Found', { status: 404 })
  }

  await requireAdminUser(request)
  const searchParams = new URL(request.url).searchParams
  const intent = searchParams.get('intent')
  if (intent === 'nearby') {
    const { radius, primaryType } = zx.parseQuery(
      request,
      z.object({
        radius: zx.NumAsString.optional().default('160'),
        primaryType: z.string(),
      }),
    )
    const res = await nearBySearch({
      latitude: area.latitude,
      longitude: area.longitude,
      radius,
      includedPrimaryTypes: [primaryType as PlaceTypes],
    })
    return { places: res.places, intent, textQuery: null, area }
  }

  if (intent === 'textQuery') {
    const { textQuery, minRating } = zx.parseQuery(
      request,
      z.object({
        textQuery: z.string(),
        minRating: zx.NumAsString.optional(),
      }),
    )
    const res = await textSearch({
      textQuery,
      latitude: area.latitude,
      longitude: area.longitude,
      radius: 160.0,
      minRating,
      // includedType: 'cafe',
    })
    return { places: res.places, intent, textQuery, area }
  }

  return { places: null, intent, textQuery: null, area }
}

export default function Index() {
  const { places, intent, textQuery, area } = useLoaderData<typeof loader>()

  return (
    <Stack className="p-4 leading-8">
      <Card>
        <CardHeader>
          <CardTitle>{area.name}</CardTitle>
          <CardDescription>
            <HStack>
              <div>{area.latitude}</div>
              <div>{area.longitude}</div>
              <a
                className="text-primary hover:underline"
                target="_blank"
                rel="noreferrer"
                href={`https://www.google.com/maps/@${area.latitude},${area.longitude},16z`}
              >
                Map
              </a>
            </HStack>
          </CardDescription>
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
              <TextQueryForm textQuery={textQuery ?? undefined} />
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
