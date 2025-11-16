import { UserButton } from '@clerk/react-router'
import { useEffect } from 'react'
import { data, href, Link, Outlet } from 'react-router'
import { getToast } from 'remix-toast'
import { toast } from 'sonner'
import { Toaster } from '~/components/ui'
import { requireAdminUser } from '~/services/auth.server'
import type { Route } from './+types/route'

export const meta: Route.MetaFunction = () => {
  return [
    { title: 'Hyperlocal Admin' },
    { name: 'description', content: 'hyperlocal' },
  ]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireAdminUser(request)
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
      <header className="flex gap-4 px-4 py-2">
        <div className="flex-1 text-2xl font-bold">
          <Link to={href('/')}>Hyperlocal Admin</Link>
        </div>
        <div>
          <UserButton />
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
