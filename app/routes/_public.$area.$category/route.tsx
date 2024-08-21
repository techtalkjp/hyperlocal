import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, type MetaFunction, Outlet } from '@remix-run/react'
import categories from '~/assets/categories.json'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: `${data?.category.names.ja} - Hyperlocal`,
  },
]

export const handle = {
  breadcrumb: (data: Awaited<ReturnType<typeof loader>>) => (
    <Link to={`/${data.areaId}/${data.category.id}`} prefetch="intent">
      {data.category.names.ja}
    </Link>
  ),
  category: (data: Awaited<ReturnType<typeof loader>>) =>
    data.category.names.ja,
}

export const loader = ({ params }: LoaderFunctionArgs) => {
  const areaId = params.area
  if (!areaId) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const categoryId = params.category
  const category = categories.find((c) => c.id === categoryId)
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  return { areaId, category }
}

export default function AreaCategoryLayout() {
  return <Outlet />
}
