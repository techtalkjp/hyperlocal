import { jaJP } from '@clerk/localizations'
import { ClerkApp, UserButton } from '@clerk/remix'
import { rootAuthLoader } from '@clerk/remix/ssr.server'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, type MetaFunction, Outlet } from '@remix-run/react'

export const meta: MetaFunction = () => {
  return [
    { title: 'Hyperlocal Admin' },
    { name: 'description', content: 'hyperlocal' },
  ]
}

export const loader = (args: LoaderFunctionArgs) => {
  return rootAuthLoader(args, () => {
    const env = {
      GA_TRACKING_ID: process.env.GA_TRACKING_ID,
      NODE_ENV: process.env.NODE_ENV,
    }
    return { env }
  })
}

const AdminLayout = () => {
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

export default ClerkApp(AdminLayout, {
  localization: jaJP,
  appearance: {
    signIn: { elements: { footer: { display: 'none' } } },
  },
})
