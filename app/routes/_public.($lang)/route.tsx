import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { getLangCityAreaCategory } from '~/features/city-area/utils'
import { AreaTitle } from './components/area-title'
import { Breadcrumbs } from './components/breadcrumbs'

export const loader = ({ request, params }: LoaderFunctionArgs) => {
  console.log('loader: _public.($lang)', params)
  const { city, lang } = getLangCityAreaCategory(request, params)
  return { city, lang }
}

export default function PublicLayout() {
  const { city, lang } = useLoaderData<typeof loader>()

  return (
    <div>
      <header className="px-2 pt-2">
        <div className="flex">
          <AreaTitle city={city} />
          <div className="flex-1" />
          <div className="flex-shrink-0">{lang.id}</div>
        </div>
        <nav>
          <Breadcrumbs>
            <Link to={`/${lang.path}`}>{city.i18n[lang.id]}</Link>
          </Breadcrumbs>
        </nav>
      </header>

      <Outlet />
    </div>
  )
}
