import { categories } from '@hyperlocal/consts'
import type { LoaderFunctionArgs, MetaFunction } from 'react-router'
import { Link, Outlet, useLoaderData } from 'react-router'
import { Card, CardContent, HStack, Stack } from '~/components/ui'
import { getPathParams } from '~/features/admin/get-path-params'
import { requireAdminUser } from '~/features/auth/services/user-session.server'
import { CategoryNav, CategoryNavItem } from './components/category-nav-item'
import { GoogleMapPopover } from './components/google-map-popover'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: `${data?.area.i18n.en} - Hyperlocal Admin`,
  },
]

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAdminUser(request)
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY
  const { city, area } = getPathParams(params)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  return { city, area, googleMapsApiKey }
}

export default function AdminCityAreaLayout() {
  const { city, area, googleMapsApiKey } = useLoaderData<typeof loader>()

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <Stack>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                <Link to={`/${city.cityId}/${area.areaId}`}>
                  {area.i18n.en}{' '}
                  <small className="text-muted-foreground">
                    {city.i18n.en}
                  </small>
                </Link>
              </h2>
              <HStack className="text-xs text-muted-foreground">
                <p>{area.latitude}</p>
                <p>{area.longitude}</p>
                <p>{area.radius}m</p>
                <GoogleMapPopover
                  area={area}
                  googleMapsApiKey={googleMapsApiKey}
                >
                  Map
                </GoogleMapPopover>
              </HStack>
            </div>
          </div>

          <CategoryNav>
            {categories.map((category) => (
              <CategoryNavItem to={category.id} key={category.id}>
                {category.i18n.en}
              </CategoryNavItem>
            ))}
          </CategoryNav>

          <Outlet />
        </Stack>
      </CardContent>
    </Card>
  )
}
