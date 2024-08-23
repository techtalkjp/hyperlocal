import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, type MetaFunction, Outlet } from '@remix-run/react'
import { getCityArea } from '~/features/city-area/utils'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: `${data?.area.name} - Hyperlocal`,
  },
]

export const handle = {
  breadcrumb: (data: Awaited<ReturnType<typeof loader>>) => (
    <Link to={`/${data.area.areaId}`}>{data.area.name}</Link>
  ),
  area: (data: Awaited<ReturnType<typeof loader>>) => data.area.name,
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { area } = await getCityArea(request, params)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  return { area }
}

export default function AreaLayout() {
  return <Outlet />
}
