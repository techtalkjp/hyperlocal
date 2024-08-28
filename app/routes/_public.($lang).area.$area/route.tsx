import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, type MetaFunction, Outlet } from '@remix-run/react'
import { getLangCityAreaCategory } from '~/features/city-area/utils'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: `${data?.area.i18n[data.lang.id]} - Hyperlocal ${data?.city.i18n[data.lang.id]} `,
  },
]

export const handle = {
  breadcrumb: (data: Awaited<ReturnType<typeof loader>>) => (
    <Link
      to={`/${data.lang.id === 'en' ? '' : `${data.lang.path}/`}area/${data.area.areaId}`}
    >
      {data.area.i18n[data.lang.id]}
    </Link>
  ),
  area: (data: Awaited<ReturnType<typeof loader>>) =>
    data.area.i18n[data.lang.id],
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { lang, city, area } = await getLangCityAreaCategory(request, params)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  return { lang, city, area }
}

export default function AreaLayout() {
  return <Outlet />
}
