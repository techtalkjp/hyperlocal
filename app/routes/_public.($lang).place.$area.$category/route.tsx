import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, type MetaFunction, Outlet } from '@remix-run/react'
import { getLangCityAreaCategory } from '~/features/city-area/utils'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: `${data?.category.i18n[data.lang.id]} - Hyperlocal`,
  },
]

export const handle = {
  breadcrumb: (data: Awaited<ReturnType<typeof loader>>) => (
    <Link
      to={`/${data.lang.id === 'en' ? '' : `${data.lang.path}/`}place/${data.area.areaId}/${data.category.id}`}
      prefetch="intent"
    >
      {data.category.i18n[data.lang.id]}
    </Link>
  ),
  category: (data: Awaited<ReturnType<typeof loader>>) =>
    data.category.i18n[data.lang.id],
}

export const loader = ({ request, params }: LoaderFunctionArgs) => {
  const { lang, area, category } = getLangCityAreaCategory(request, params)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  return { lang, area, category }
}

export default function AreaCategoryLayout() {
  return <Outlet />
}
