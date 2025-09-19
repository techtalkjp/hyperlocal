import React from 'react'
import { Link, href } from 'react-router'
import { Button, Stack } from '~/components/ui'
import { getPathParams } from '~/features/admin/get-path-params'
import { PlaceCard } from '~/features/place/components'
import { requireAdminUser } from '~/services/auth.server'
import type { Route } from './+types/route'
import { listAreaPlaces } from './queries.server'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  await requireAdminUser(request)
  const { city, area, lang, category, rankType } = getPathParams(params)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!rankType) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (rankType !== 'rating' && rankType !== 'review') {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const places = await listAreaPlaces(area.areaId, category.id, rankType)

  return {
    city,
    lang,
    area,
    category,
    rankType,
    places,
  }
}

export default function AdminCreategoryIndex({
  loaderData: { city, lang, area, category, places },
}: Route.ComponentProps) {
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
                      to={`${href('/place/:place/:lang?', {
                        place: place.id,
                        lang: lang?.id,
                      })}?city=${city.cityId}&area=${area.areaId}&category=${category.id}`}
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
