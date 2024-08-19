import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, type MetaFunction, Outlet } from '@remix-run/react'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: `${data?.category.name} - Hyperlocal`,
  },
]

export const handle = {
  breadcrumb: (data: Awaited<ReturnType<typeof loader>>) => (
    <Link to={`/${data.areaId}/${data.category.id}`} prefetch="intent">
      {data.category.name}
    </Link>
  ),
  category: (data: Awaited<ReturnType<typeof loader>>) => data.category.name,
}

export const loader = ({ params }: LoaderFunctionArgs) => {
  const areaId = params.area
  if (!areaId) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const categoryId = params.category
  if (!categoryId) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const category = {
    id: categoryId,
    name: 'カフェ',
  }

  return { areaId, category }
}

export default function AreaCategoryLayout() {
  return <Outlet />
}
