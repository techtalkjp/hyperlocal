import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import {
  HStack,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/components/ui'
import { getCityAreaCategory } from '~/features/admin/city-area-category/get-city-area-category'
import { PlaceCard } from '~/features/place/components'
import { NearbyPlaceList } from '~/routes/admin.resources.google-places-nearby/route'
import { requireAdminUser } from '~/services/auth.server'
import { LLMTest } from './components'
import { listAreaGooglePlaces } from './functions/queries.server'

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

export default function Index() {
  const { city, area, category, areaGooglePlaces } =
    useLoaderData<typeof loader>()

  return (
    <Tabs defaultValue="registered">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="registered">Registered</TabsTrigger>
        <TabsTrigger value="nearby">Google Place API Nearby</TabsTrigger>
      </TabsList>
      <TabsContent value="registered">
        <Stack>
          <h2 className="text-xl font-semibold">Registered Places</h2>
          {areaGooglePlaces.length > 0 ? (
            <div>{areaGooglePlaces.length} places found.</div>
          ) : (
            <p className="grid h-32 place-content-center text-muted-foreground">
              No places found
            </p>
          )}
          {areaGooglePlaces?.map((place, idx) => {
            return (
              <HStack key={`${place.categoryId}-${place.id}`}>
                <LLMTest place={place} />
                <PlaceCard place={place} no={idx + 1} />
              </HStack>
            )
          })}
        </Stack>
      </TabsContent>
      <TabsContent value="nearby">
        <Stack>
          <h2 className="text-xl font-semibold">Google Places API Nearby</h2>

          <NearbyPlaceList
            cityId={city.cityId}
            areaId={area.areaId}
            categoryId={category.id}
          />
        </Stack>
      </TabsContent>
    </Tabs>
  )
}
