import { areas, categories, cities, languages } from '@hyperlocal/consts'
import { Link, Outlet, redirect, useLocation, useParams } from 'react-router'
import { Badge, Stack } from '~/components/ui'
import { CategoryNav, CategoryNavItem } from './+components/category-nav-item'
import type { Route } from './+types/route'

export const clientLoader = ({ params, request }: Route.ClientLoaderArgs) => {
  const lang =
    params.lang === undefined
      ? languages[0]
      : (languages.find((l) => l.id === params.lang) ?? languages[0])
  const city = cities[0]
  const area = areas.find((a) => a.areaId === params.area)
  const category = categories.find((c) => c.id === params.category)

  if (!area || !category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  // Detect ranking type from URL path (rank is a child route param)
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/')
  const lastSegment = pathSegments[pathSegments.length - 1]
  const rankingType = (['rating', 'review'] as const).find(
    (r) => r === lastSegment,
  )

  // Redirect to rating if no ranking type is specified
  if (!rankingType && lastSegment !== 'nearme') {
    throw redirect(
      `/${lang.id === 'en' ? '' : `${lang.id}/`}area/${area.areaId}/${category.id}/rating`,
    )
  }

  return { lang, city, area, category, rankingType }
}

export default function AreaCategory({
  loaderData: { lang, area },
}: Route.ComponentProps) {
  const location = useLocation()

  const params = useParams()
  const rank = location.pathname.endsWith('/nearme') ? 'nearme' : params.rank

  return (
    <Stack>
      <Link
        to={`${lang.path}area/${area.areaId}`}
        prefetch="viewport"
        viewTransition
      >
        <div className="hover:bg-secondary flex rounded-md border p-2">
          <div className="flex-1">
            <div
              className="font-semibold"
              style={{ viewTransitionName: `area-title-${area.areaId}` }}
            >
              {area.i18n[lang.id]}
            </div>
            <div
              className="text-muted-foreground text-xs"
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
