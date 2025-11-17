import { UserButton } from '@clerk/react-router'
import { useEffect } from 'react'
import { data, href, Link, Outlet } from 'react-router'
import { getToast } from 'remix-toast'
import { toast } from 'sonner'
import { Toaster } from '~/components/ui'
import type { Route } from './+types/route'

export const meta: Route.MetaFunction = () => {
  return [
    { title: 'Hyperlocal Admin' },
    { name: 'description', content: 'hyperlocal' },
  ]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { toast, headers } = await getToast(request)
  return data({ toastData: toast }, { headers: headers })
}

const AdminLayout = ({ loaderData: { toastData } }: Route.ComponentProps) => {
  // Sync with Sonner toast library to display server-side toast messages
  useEffect(() => {
    if (!toastData) return

    const toastFn = toast[toastData.type] ?? toast.info
    toastFn(toastData.message, {
      description: toastData.description,
      position: 'top-right',
    })
  }, [toastData])

  return (
    <div>
      <header className="border-b">
        <div className="flex items-center gap-4 px-4 py-2">
          <div className="text-2xl font-bold">
            <Link to={href('/')}>Hyperlocal Admin</Link>
          </div>
          <nav className="ml-6 flex flex-1 gap-4">
            <Link to={href('/articles')} className="hover:underline">
              Articles
            </Link>
            <Link to={href('/areas')} className="hover:underline">
              Areas
            </Link>
          </nav>
          <div>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="px-2">
        <Outlet />
      </main>

      <Toaster />
    </div>
  )
}

export default AdminLayout
