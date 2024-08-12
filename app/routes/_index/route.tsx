import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
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
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/components/ui'
import { Rating } from './components/rating'
import { nearBySearch, textSearch } from './functions/places'

export const meta: MetaFunction = () => {
  return [
    { title: 'Hyperlocal' },
    { name: 'description', content: 'hyperlocal web' },
  ]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams
  const intent = searchParams.get('intent')
  if (intent === 'nearby') {
    const res = await nearBySearch({
      latitude: 35.6694464,
      longitude: 139.7670348,
      radius: 160.0,
      minRating: 4,
      includedPrimaryTypes: ['cafe'],
    })
    return { places: res.places, intent, textQuery: null }
  }

  if (intent === 'textQuery') {
    const textQuery = searchParams.get('textQuery') ?? ''
    const res = await textSearch({
      textQuery,
      latitude: 35.6694464,
      longitude: 139.7670348,
      radius: 160.0,
      minRating: 4,
      // includedType: 'cafe',
    })
    return { places: res.places, intent, textQuery }
  }

  return { places: null, intent, textQuery: null }
}

export default function Index() {
  const { places, intent, textQuery } = useLoaderData<typeof loader>()

  return (
    <Stack className="m-4 leading-8">
      <h1 className="mb-4 text-4xl font-bold">Hyperlocal Web</h1>
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
                  <Button type="submit" name="intent" value="textQuery">
                    TextQuery
                  </Button>
                </Stack>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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
