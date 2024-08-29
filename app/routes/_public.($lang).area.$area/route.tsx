import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, type MetaFunction, Outlet } from '@remix-run/react'
import {
  BreadcrumbLink,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui'
import allAreas from '~/consts/areas'
import { getLangCityAreaCategory } from '~/features/city-area/utils'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: `${data?.area.i18n[data.lang.id]} - Hyperlocal ${data?.city.i18n[data.lang.id]} `,
  },
]

export const handle = {
  breadcrumb: (data: Awaited<ReturnType<typeof loader>>) => (
    <BreadcrumbLink asChild>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1">
          {data.area.i18n[data.lang.id]}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {data.areas.map((area) => (
            <DropdownMenuItem key={area.areaId} asChild>
              <Link
                to={`/${data.lang.id === 'en' ? '' : `${data.lang.path}/`}area/${area.areaId}`}
                prefetch="intent"
                className={area.areaId === data.area.areaId ? 'font-bold' : ''}
              >
                {area.i18n[data.lang.id]}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </BreadcrumbLink>
  ),
  area: (data: Awaited<ReturnType<typeof loader>>) =>
    data.area.i18n[data.lang.id],
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { lang, city, area } = await getLangCityAreaCategory(request, params)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const areas = allAreas.filter((a) => a.cityId === city.cityId)

  return { lang, city, area, areas }
}

export default function AreaLayout() {
  return <Outlet />
}
