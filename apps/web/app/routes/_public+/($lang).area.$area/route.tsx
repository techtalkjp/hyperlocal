import { areas as allAreas, categories } from '@hyperlocal/consts'
import type { LoaderFunctionArgs } from '@remix-run/node'
import {
  Link,
  Outlet,
  useLoaderData,
  type MetaFunction,
} from '@remix-run/react'
import { Stack } from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'
import { CategoryNav, CategoryNavItem } from './components/category-nav-item'

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

export default function AreaLayout() {
  const { lang, area } = useLoaderData<typeof loader>()

  return (
    <Stack>
      <CategoryNav className="px-1">
        {categories.map((category) => (
          <CategoryNavItem
            key={category.id}
            to={`/${lang.id === 'en' ? '' : `${lang.id}/`}area/${area.areaId}/${category.id}`}
          >
            {category.i18n[lang.id]}
          </CategoryNavItem>
        ))}
      </CategoryNav>

      <Outlet />
    </Stack>
  )
}
