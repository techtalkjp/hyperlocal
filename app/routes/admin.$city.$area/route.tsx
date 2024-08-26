import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import categories from '~/assets/categories.json'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  HStack,
  Stack,
} from '~/components/ui'
import { getCityAreaCategory } from '~/features/admin/city-area-category/get-city-area-category'
import { requireAdminUser } from '~/services/auth.server'
import { CategoryNav, CategoryNavItem } from './components/category-nav-item'
import { GoogleMapPopover } from './components/google-map-popover'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: `Admin - ${data?.area.name}`,
  },
]

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAdminUser(request)
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY
  const { city, area } = getCityAreaCategory(params)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  return { city, area, googleMapsApiKey }
}

export default function AdminCityAreaLayout() {
  const { city, area, googleMapsApiKey } = useLoaderData<typeof loader>()
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link to={`/admin/${city.cityId}/${area.areaId}`}>
            {area.name}{' '}
            <small className="text-muted-foreground">{city.name}</small>
          </Link>
        </CardTitle>
        <HStack className="text-sm text-muted-foreground">
          <p>{area.latitude}</p>
          <p>{area.longitude}</p>
          <p>{area.radius}m</p>
          <GoogleMapPopover area={area} googleMapsApiKey={googleMapsApiKey}>
            Map
          </GoogleMapPopover>
        </HStack>
      </CardHeader>
      <CardContent>
        <Stack>
          <CategoryNav>
            {categories.map((category) => (
              <CategoryNavItem to={category.id} key={category.id}>
                {category.names.en}
              </CategoryNavItem>
            ))}
          </CategoryNav>

          <Outlet />
        </Stack>
      </CardContent>
    </Card>
  )
}
