import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, type MetaFunction, Outlet } from '@remix-run/react'
import { getLangCityAreaCategory } from '~/features/city-area/utils'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: `${data?.category.i18n.en} - Hyperlocal`,
  },
]

export const handle = {
  breadcrumb: (data: Awaited<ReturnType<typeof loader>>) => (
    <Link to={`/${data.area.areaId}/${data.category.id}`} prefetch="intent">
      {data.category.i18n.en}
    </Link>
  ),
  category: (data: Awaited<ReturnType<typeof loader>>) => data.category.i18n.en,
}

export const loader = ({ request, params }: LoaderFunctionArgs) => {
  const { area, category, lang } = getLangCityAreaCategory(request, params)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  return { area, category, lang }
}

export default function AreaCategoryLayout() {
  return <Outlet />
}
