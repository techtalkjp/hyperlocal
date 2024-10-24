import { areas as allAreas } from '@hyperlocal/consts'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, type MetaFunction } from '@remix-run/react'
import { getPathParams } from '~/features/city-area/utils'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: `${data?.area.i18n[data.lang.id]} - Hyperlocal ${data?.city.i18n[data.lang.id]} `,
  },
]

export const shouldRevalidate = () => true

export const handle = {
  breadcrumb: (data: Awaited<ReturnType<typeof loader>>) => (
    <Link
      to={`/${data.lang.id === 'en' ? '' : `${data.lang.path}/`}area/${data.area.areaId}`}
      prefetch="intent"
    >
      {data.area.i18n[data.lang.id]}
    </Link>
  ),
  area: (data: Awaited<ReturnType<typeof loader>>) =>
    data.area.i18n[data.lang.id],
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { lang, city, area, category } = await getPathParams(request, params)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const areas = allAreas.filter((a) => a.cityId === city.cityId)

  return { lang, city, area, category, areas }
}
