import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import React from 'react'
import {
  Button,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/components/ui'
import { getCityAreaCategory } from '~/features/admin/city-area-category/get-city-area-category'
import { PlaceCard } from '~/features/place/components'
import { requireAdminUser } from '~/services/auth.server'
import { listAreaPlaces } from './queries.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAdminUser(request)
  const { city, area, category } = getCityAreaCategory(params)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const places = await listAreaPlaces(area.areaId, category.id)

  return {
    city,
    area,
    category,
    places,
  }
}

export default function AdminCreategoryIndex() {
  const { city, area, category, places } = useLoaderData<typeof loader>()

  return (
    <Tabs defaultValue="registered">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="registered">Registered</TabsTrigger>
      </TabsList>
      <TabsContent value="registered">
        <Stack>
          {places.length > 0 ? (
            <div>{places.length} places found.</div>
          ) : (
            <p className="grid h-32 place-content-center text-muted-foreground">
              No places found
            </p>
          )}

          {places.length > 0 && (
            <div className="grid grid-cols-[auto_1fr] gap-2">
              {places.map((place, idx) => {
                return (
                  <React.Fragment key={`${category.id}-${place.id}`}>
                    <Stack>
                      <Button asChild>
                        <Link
                          to={`/admin/${city.cityId}/${area.areaId}/${category.id}/${place.id}`}
                        >
                          Details
                        </Link>
                      </Button>
                    </Stack>
                    <PlaceCard place={place} no={idx + 1} />
                  </React.Fragment>
                )
              })}
            </div>
          )}
        </Stack>
      </TabsContent>
    </Tabs>
  )
}
