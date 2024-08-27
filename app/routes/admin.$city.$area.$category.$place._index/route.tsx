import type { LoaderFunctionArgs } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { getCityAreaCategory } from '~/features/admin/city-area-category/get-city-area-category'
import { requireAdminUser } from '~/services/auth.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAdminUser(request)
  const { city, area, category } = getCityAreaCategory(params)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const { place: placeId } = params
  if (!placeId) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  return { placeId }
}

export default function PlacePage() {
  const { placeId } = useLoaderData<typeof loader>()

  return <Outlet />
}
