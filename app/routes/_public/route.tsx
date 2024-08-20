import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { AreaTitle } from './components/area-title'
import { Breadcrumbs } from './components/breadcrumbs'

export const loader = () => {
  return { city: { id: 'tokyo', name: '東京' } }
}

export default function PublicLayout() {
  const { city } = useLoaderData<typeof loader>()

  return (
    <div>
      <header className="px-2 pt-2">
        <AreaTitle city={city} />
        <nav>
          <Breadcrumbs>
            <Link to="/">{city.name}</Link>
          </Breadcrumbs>
        </nav>
      </header>

      <Outlet />
    </div>
  )
}
