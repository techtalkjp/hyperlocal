import { UserButton } from '@clerk/react-router'
import { useEffect } from 'react'
import type { LoaderFunctionArgs, MetaFunction } from 'react-router'
import { data, Link, Outlet, useLoaderData } from 'react-router'
import { getToast } from 'remix-toast'
import { toast } from 'sonner'
import { Toaster } from '~/components/ui'
import { requireAdminUser } from '~/services/auth.server'

export const meta: MetaFunction = () => {
  return [
    { title: 'Hyperlocal Admin' },
    { name: 'description', content: 'hyperlocal' },
  ]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdminUser(request)
  const { toast, headers } = await getToast(request)
  return data({ toastData: toast }, { headers: headers })
}

const AdminLayout = () => {
  const { toastData } = useLoaderData<typeof loader>()

  useEffect(() => {
    if (!toastData) {
      return
    }
    let toastFn = toast.info
    if (toastData.type === 'error') {
      toastFn = toast.error
    } else if (toastData.type === 'success') {
      toastFn = toast.success
    }
    toastFn(toastData.message, {
      description: toastData.description,
      position: 'top-right',
    })
  }, [toastData])

  return (
    <div>
      <header className="flex gap-4 px-4 py-2">
        <div className="flex-1 text-2xl font-bold">
          <Link to="/">Hyperlocal Admin</Link>
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
