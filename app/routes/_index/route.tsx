import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Stack,
} from '~/components/ui'
import { crawl } from './functions/crawl'

export const meta: MetaFunction = () => {
  return [
    { title: 'Hyperlocal' },
    { name: 'description', content: 'hyperlocal web' },
  ]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams
  const intent = searchParams.get('intent')
  if (intent === 'search') {
    const res = await crawl({
      latitude: 35.6694638,
      longitude: 139.7644921,
      radius: 500.0,
      includedPrimaryTypes: ['restaurant'],
    })
    console.log(JSON.stringify(res.places, null, 2))
    return { places: res.places }
  }

  return { places: null }
}

export default function Index() {
  const { places } = useLoaderData<typeof loader>()

  return (
    <Stack className="m-4 leading-8">
      <h1 className="mb-4 text-4xl font-bold">Hyperlocal Web</h1>
      <Card>
        <CardHeader>
          <CardTitle>Crawl</CardTitle>
          <CardDescription>places api searchNearby testing.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="GET">
            <Button type="submit" name="intent" value="search">
              Search
            </Button>
          </Form>
        </CardContent>
      </Card>

      {places?.map((place) => {
        return (
          <Card key={place.id}>
            <CardHeader>
              <CardTitle>{place.displayName.text}</CardTitle>
              <CardDescription>{place.shortFormattedAddress}</CardDescription>
            </CardHeader>
            <CardContent>
              <pre>{JSON.stringify(place, null, 2)}</pre>
            </CardContent>
          </Card>
        )
      })}
    </Stack>
  )
}
