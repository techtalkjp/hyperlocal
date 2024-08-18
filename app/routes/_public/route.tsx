import { Outlet } from '@remix-run/react'
import { AreaTitle } from './components/area-title'
import { Breadcrumbs } from './components/breadcrumbs'

export default function PublicLayout() {
  return (
    <div>
      <header className="px-2 pt-2">
        <AreaTitle />
        <nav>
          <Breadcrumbs />
        </nav>
      </header>

      <Outlet />
    </div>
  )
}
