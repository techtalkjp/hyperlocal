import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, redirect, type MetaFunction } from '@remix-run/react'
import { getPathParams } from '~/features/city-area/utils'
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
    <Link
      to={`/${data.lang.id === 'en' ? '' : `${data.lang.path}/`}area/${data.area.areaId}/${data.category.id}`}
      prefetch="intent"
    >
      {data.category.i18n[data.lang.id]}
    </Link>
  ),
  category: (data: Awaited<ReturnType<typeof loader>>) =>
    data.category.i18n[data.lang.id],
}

export const loader = ({ request, params }: LoaderFunctionArgs) => {
  const { lang, city, area, category, rankingType } = getPathParams(
    request,
    params,
  )
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  if (!rankingType && !request.url.endsWith('distance')) {
    throw redirect(
      `/${lang.id === 'en' ? '' : `${lang.id}/`}area/${area.areaId}/${category.id}/rating`,
    )
  }

  return { lang, city, area, category }
}
