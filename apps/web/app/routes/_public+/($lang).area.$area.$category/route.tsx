import { categories, languages } from '@hyperlocal/consts'
import type { LoaderFunctionArgs } from 'react-router'
import {
  Link,
  Outlet,
  redirect,
  useLoaderData,
  useLocation,
  useParams,
} from 'react-router'
import { Badge, Stack } from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'
import { generateAreaCategoryMetaDescription } from '~/features/seo/meta-area-category'
import type { Route } from './+types/route'
import { CategoryNav, CategoryNavItem } from './components/category-nav-item'

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data) return []
  return [
    {
      title: `${data.area.i18n[data.lang.id]} ${data.category.i18n[data.lang.id]} - Hyperlocal ${data?.city.i18n[data.lang.id]}`,
    },
    {
      name: 'description',
      content: generateAreaCategoryMetaDescription(
        data.city.cityId,
        data.area.areaId,
        data.category.id,
        data.lang.id,
      ),
    },
    ...languages.map((lang) => ({
      rel: 'alternate',
      hrefLang: lang.id,
      href: `${lang.path}area/${data.area.areaId}/${data.category.id}/${data.rankingType}`,
      tagName: 'link',
    })),
    {
      rel: 'alternate',
      hrefLang: 'x-default',
      href: `/area/${data.area.areaId}/${data.category.id}/${data.rankingType}`,
      tagName: 'link',
    },
    {
      'script:ld+json': {
        '@context': 'http://schema.org',
        '@type': 'LocalBusiness',
        name: `${data.city.i18n[data.lang.id]} ${data.area.i18n[data.lang.id]} ${data.category.i18n[data.lang.id]}`,
        description: generateAreaCategoryMetaDescription(
          data.city.cityId,
          data.area.areaId,
          data.category.id,
          data.lang.id,
        ),
        url: `${data.lang.path}area/${data.area.areaId}/${data.category.id}/${data.rankingType}`,
      },
    },
  ]
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

  if (!rankingType && !request.url.endsWith('nearme')) {
    throw redirect(
      `/${lang.id === 'en' ? '' : `${lang.id}/`}area/${area.areaId}/${category.id}/rating`,
    )
  }

  return { lang, city, area, category, rankingType }
}

export default function AreaCategory() {
  const { lang, area } = useLoaderData<typeof loader>()
  const location = useLocation()

  const params = useParams()
  const rank = location.pathname.endsWith('/nearme') ? 'nearme' : params.rank

  return (
    <Stack>
      <Link to={`${lang.path}area/${area.areaId}`} viewTransition>
        <div className="flex rounded-md border p-2 hover:bg-secondary">
          <div className="flex-1">
            <div
              className="font-semibold"
              style={{ viewTransitionName: `area-title-${area.areaId}` }}
            >
              {area.i18n[lang.id]}
            </div>
            <div
              className="text-xs text-muted-foreground"
              style={{ viewTransitionName: `area-description-${area.areaId}` }}
            >
              {area.description[lang.id]}
            </div>
          </div>
          <div>
            <Badge variant="secondary">Area</Badge>
          </div>
        </div>
      </Link>

      <CategoryNav>
        {categories.map((category) => (
          <CategoryNavItem
            key={category.id}
            to={`${lang.path}area/${area.areaId}/${category.id}${rank ? `/${rank}` : ''}`}
            viewTransition
            style={{ viewTransitionName: `nav-category-${category.id}` }}
          >
            {category.i18n[lang.id]}
          </CategoryNavItem>
        ))}
      </CategoryNav>
      <Outlet />
    </Stack>
  )
}
