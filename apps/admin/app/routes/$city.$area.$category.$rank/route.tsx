import React from 'react'
import type { LoaderFunctionArgs } from 'react-router'
import { Link, useLoaderData } from 'react-router'
import { Button, Stack } from '~/components/ui'
import { getPathParams } from '~/features/admin/get-path-params'
import { requireAdminUser } from '~/features/auth/services/user-session.server'
import { PlaceCard } from '~/features/place/components'
import { listAreaPlaces } from './queries.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAdminUser(request)
  const { city, area, category, rank } = getPathParams(params)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!rank) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const places = await listAreaPlaces(area.areaId, category.id, 'review')

  return {
    city,
    area,
    category,
    rank,
    places,
  }
}

export default function AdminCreategoryIndex() {
  const { city, area, category, rank, places } = useLoaderData<typeof loader>()

  return (
    <Stack>
      {places.length > 0 ? (
        <div>{places.length} places found.</div>
      ) : (
        <p className="text-muted-foreground grid h-32 place-content-center">
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
                      to={`/place/${place.id}?city=${city.cityId}&area=${area.areaId}&category=${category.id}`}
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
  )
}