import { categories } from '@hyperlocal/consts'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, type MetaFunction, Outlet } from '@remix-run/react'
import {
  BreadcrumbLink,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui'
import { getLangCityAreaCategory } from '~/features/city-area/utils'
import { generateAreaCategoryMetaDescription } from '~/features/seo/meta-area-category'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title:
      data &&
      `${data.area.i18n[data.lang.id]} ${data.category.i18n[data.lang.id]} - Hyperlocal ${data?.city.i18n[data.lang.id]}`,
  },
  {
    name: 'description',
    content:
      data &&
      generateAreaCategoryMetaDescription(
        data.city.cityId,
        data.area.areaId,
        data.category.id,
        data.lang.id,
      ),
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
          <DropdownMenuItem className="cursor-pointer font-semibold" asChild>
            <Link
              to={`/${data.lang.id === 'en' ? '' : `${data.lang.path}/`}area/${data.area.areaId}/${data.category.id}`}
              prefetch="intent"
            >
              {data.category.i18n[data.lang.id]}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {categories
            .filter((c) => c.id !== data.category.id)
            .map((category) => (
              <DropdownMenuItem
                key={category.id}
                className="cursor-pointer"
                asChild
              >
                <Link
                  to={`/${data.lang.id === 'en' ? '' : `${data.lang.path}/`}area/${data.area.areaId}/${category.id}`}
                  prefetch="intent"
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

export default function CategoryLayout() {
  return <Outlet />
}
