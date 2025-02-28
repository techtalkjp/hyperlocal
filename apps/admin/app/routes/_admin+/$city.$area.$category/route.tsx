import { href, Link, Outlet, replace } from 'react-router'
import { Stack, Tabs, TabsList, TabsTrigger } from '~/components/ui'
import { getPathParams } from '~/features/admin/get-path-params'
import { requireAdminUser } from '~/services/auth.server'
import type { Route } from './+types/route'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  await requireAdminUser(request)
  const { city, area, category, rankType } = getPathParams(params)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!rankType) {
    throw replace('rating')
  }
  return { city, area, category, rankType }
}

export default function AdminCreategoryIndex({
  loaderData: { city, area, category, rankType },
}: Route.ComponentProps) {
  return (
    <Stack>
      <Tabs defaultValue={rankType}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="rating" asChild>
            <Link
              to={href('/:city/:area/:category/:rank', {
                city: city.cityId,
                area: area.areaId,
                category: category.id,
                rank: 'rating',
              })}
            >
              Rating
            </Link>
          </TabsTrigger>
          <TabsTrigger value="review" asChild>
            <Link
              to={href('/:city/:area/:category/:rank', {
                city: city.cityId,
                area: area.areaId,
                category: category.id,
                rank: 'review',
              })}
            >
              Review
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Outlet />
    </Stack>
  )
}
