import { UserButton } from '@clerk/remix'
import { Link, type MetaFunction, Outlet } from '@remix-run/react'

export const meta: MetaFunction = () => {
  return [
    { title: 'Hyperlocal Admin' },
    { name: 'description', content: 'hyperlocal' },
  ]
}

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

      <main className="px-4 pt-2">
        <Outlet />
      </main>
    </div>
  )
}
