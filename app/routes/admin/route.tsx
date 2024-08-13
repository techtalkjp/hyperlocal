import { UserButton } from '@clerk/remix'

import { Link, Outlet } from '@remix-run/react'
export default function AdminLayout() {
  return (
    <div>
      <header className="flex gap-4 p-4">
        <div className="flex-1 text-2xl font-bold">
          <Link to="/admin">Hyperlocal Admin</Link>
        </div>
        <div>
          <UserButton showName />
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
