import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { zx } from 'zodix'
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

export const meta: MetaFunction = () => {
  return [
    { title: 'Hyperlocal' },
    { name: 'description', content: 'hyperlocal web' },
  ]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireAdminUser(request)
  console.log('login', userId)

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
      latitude: 35.6694464,
      longitude: 139.7670348,
      radius,
      includedPrimaryTypes: [primaryType as PlaceTypes],
    })
    return { places: res.places, intent, textQuery: null }
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
      latitude: 35.6694464,
      longitude: 139.7670348,
      radius: 160.0,
      minRating,
      // includedType: 'cafe',
    })
    return { places: res.places, intent, textQuery }
  }

  return { places: null, intent, textQuery: null }
}

export default function Index() {
  const { places, intent, textQuery } = useLoaderData<typeof loader>()

  return (
    <Stack className="p-4 leading-8">
      <Card>
        <CardHeader>
          <CardTitle>Places</CardTitle>
          <CardDescription>places api testing.</CardDescription>
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

      {places && <div>{places.length} results found</div>}

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
