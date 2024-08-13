import { UserButton } from '@clerk/remix'

import { Outlet } from '@remix-run/react'
export default function AdminLayout() {
  return (
    <div>
      <header className="flex gap-4 p-4">
        <div className="flex-1 text-2xl font-bold">Hyperlocal Admin</div>
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
