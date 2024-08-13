import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
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
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/components/ui'
import { requireAdminUser } from '~/services/auth.server'
import type { PlaceTypes } from '~/services/google-places'
import { PlaceTypeSelect } from './components/place-type-select'
import { Rating } from './components/rating'
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
              <Form method="GET">
                <Stack>
                  <div>
                    <Label>半径</Label>
                    <Slider
                      min={0}
                      max={1000}
                      step={10}
                      defaultValue={[160]}
                      name="radius"
                    >
                      Radius
                    </Slider>
                  </div>
                  <div>
                    <PlaceTypeSelect name="primaryType" />
                  </div>
                  <Button type="submit" name="intent" value="nearby">
                    Nearby Search
                  </Button>
                </Stack>
              </Form>
            </TabsContent>

            <TabsContent value="textQuery">
              <Form method="GET">
                <Stack>
                  <Input
                    id="textQuery"
                    name="textQuery"
                    defaultValue={textQuery ?? undefined}
                    placeholder="text query"
                  />
                  <div>
                    <Label htmlFor="minRating">Min Raiting</Label>
                    <Select name="minRating" defaultValue="">
                      <SelectTrigger id="minRaitng">
                        <SelectValue placeholder="No Limit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4.5">4.5</SelectItem>
                        <SelectItem value="4.0">4.0</SelectItem>
                        <SelectItem value="3.5">3.5</SelectItem>
                        <SelectItem value="3.0">3.0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" name="intent" value="textQuery">
                    TextQuery
                  </Button>
                </Stack>
              </Form>
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
