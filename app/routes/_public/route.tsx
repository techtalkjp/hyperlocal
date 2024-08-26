import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { getCityArea } from '~/features/city-area/utils'
import { AreaTitle } from './components/area-title'
import { Breadcrumbs } from './components/breadcrumbs'

export const loader = ({ request, params }: LoaderFunctionArgs) => {
  const { city } = getCityArea(request, params)
  return { city }
}

export default function PublicLayout() {
  const { city } = useLoaderData<typeof loader>()

  return (
    <div>
      <header className="px-2 pt-2">
        <AreaTitle city={city} />
        <nav>
          <Breadcrumbs>
            <Link to="/">{city.i18n.en}</Link>
          </Breadcrumbs>
        </nav>
      </header>

      <Outlet />
    </div>
  )
}
