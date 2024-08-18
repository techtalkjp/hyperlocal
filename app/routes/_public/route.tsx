import { Outlet } from '@remix-run/react'
import { AreaTitle } from './components/area-title'
import { Breadcrumbs } from './components/breadcrumbs'

export default function PublicLayout() {
  return (
    <div>
      <AreaTitle />

      <Breadcrumbs />

      <Outlet />
    </div>
  )
}
