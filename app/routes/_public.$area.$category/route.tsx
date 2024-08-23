import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, type MetaFunction, Outlet } from '@remix-run/react'
import categories from '~/assets/categories.json'
import { getCityArea } from '~/features/city-area/utils'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: `${data?.category.names.ja} - Hyperlocal`,
  },
]

export const handle = {
  breadcrumb: (data: Awaited<ReturnType<typeof loader>>) => (
    <Link to={`/${data.area.areaId}/${data.category.id}`} prefetch="intent">
      {data.category.names.ja}
    </Link>
  ),
  category: (data: Awaited<ReturnType<typeof loader>>) =>
    data.category.names.ja,
}

export const loader = ({ request, params }: LoaderFunctionArgs) => {
  const { area } = getCityArea(request, params)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const categoryId = params.category
  const category = categories.find((c) => c.id === categoryId)
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  return { area, category }
}

export default function AreaCategoryLayout() {
  return <Outlet />
}
