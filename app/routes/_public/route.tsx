import { Outlet } from '@remix-run/react'

export default function PublicLayout() {
  return (
    <div>
      <h1 className="text-xl font-bold">Hyperlocal</h1>

      <Outlet />
    </div>
  )
}
