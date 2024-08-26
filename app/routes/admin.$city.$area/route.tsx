import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node'
import { Link, Outlet, useFetcher, useLoaderData } from '@remix-run/react'
import { jsonWithSuccess } from 'remix-toast'
import categories from '~/assets/categories.json'
import { Button, Card, CardContent, HStack, Stack } from '~/components/ui'
import { getCityAreaCategory } from '~/features/admin/city-area-category/get-city-area-category'
import { requireAdminUser } from '~/services/auth.server'
import { registerAreaGooglePlacesCategoryTask } from '~/trigger/register-area-google-places-category'
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

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await requireAdminUser(request)
  const { city, area } = getCityAreaCategory(params)
  if (!city) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const handle = await registerAreaGooglePlacesCategoryTask.batchTrigger(
    categories.map((category) => ({
      payload: {
        cityId: area.cityId,
        areaId: area.areaId,
        radius: area.radius,
        categoryId: category.id,
      },
    })),
  )

  return jsonWithSuccess(
    { handle },
    {
      message: 'Task triggered',
      description: `Triggered ${categories.length} tasks: ${city.name} - ${area.areaId}, ${categories.length} categories, ${area.radius}m`,
    },
  )
}

export default function AdminCityAreaLayout() {
  const { city, area, googleMapsApiKey } = useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof action>()

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <Stack>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                <Link to={`/admin/${city.cityId}/${area.areaId}`}>
                  {area.name}{' '}
                  <small className="text-muted-foreground">{city.name}</small>
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
            <fetcher.Form method="POST">
              <Button
                type="submit"
                isLoading={fetcher.state === 'submitting'}
                variant="outline"
              >
                Register
              </Button>
            </fetcher.Form>
          </div>

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
