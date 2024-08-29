import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, type MetaFunction, Outlet } from '@remix-run/react'
import {
  BreadcrumbLink,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui'
import categories from '~/consts/categories'
import { getLangCityAreaCategory } from '~/features/city-area/utils'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: `${data?.area.i18n[data.lang.id]} ${data?.category.i18n[data.lang.id]} - Hyperlocal ${data?.city.i18n[data.lang.id]}`,
  },
]

export const handle = {
  breadcrumb: (data: Awaited<ReturnType<typeof loader>>) => (
    <BreadcrumbLink asChild>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1">
          {data.category.i18n[data.lang.id]}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {categories.map((category) => (
            <DropdownMenuItem key={category.id} asChild>
              <Link
                to={`/${data.lang.id === 'en' ? '' : `${data.lang.path}/`}area/${data.area.areaId}/${category.id}`}
                prefetch="intent"
                className={category.id === data.category.id ? 'font-bold' : ''}
              >
                {category.i18n[data.lang.id]}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </BreadcrumbLink>
  ),
  category: (data: Awaited<ReturnType<typeof loader>>) =>
    data.category.i18n[data.lang.id],
}

export const loader = ({ request, params }: LoaderFunctionArgs) => {
  const { lang, city, area, category } = getLangCityAreaCategory(
    request,
    params,
  )
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  return { lang, city, area, category }
}

export default function AreaCategoryLayout() {
  return <Outlet />
}
