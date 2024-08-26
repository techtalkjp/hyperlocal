import { jaJP } from '@clerk/localizations'
import { ClerkApp, UserButton } from '@clerk/remix'
import { rootAuthLoader } from '@clerk/remix/ssr.server'
import type { LoaderFunctionArgs } from '@remix-run/node'
import {
  json,
  Link,
  type MetaFunction,
  Outlet,
  useLoaderData,
} from '@remix-run/react'
import { useEffect } from 'react'
import { getToast } from 'remix-toast'
import { toast } from 'sonner'
import { Toaster } from '~/components/ui'

export const meta: MetaFunction = () => {
  return [
    { title: 'Hyperlocal Admin' },
    { name: 'description', content: 'hyperlocal' },
  ]
}

export const loader = (args: LoaderFunctionArgs) => {
  return rootAuthLoader(args, async () => {
    const { toast, headers } = await getToast(args.request)
    return json({ toastData: toast }, { headers: headers })
  })
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
          <Link to="/admin">Hyperlocal Admin</Link>
        </div>
        <div>
          <UserButton showName />
        </div>
      </header>

      <main className="px-2">
        <Outlet />
      </main>

      <Toaster />
    </div>
  )
}

export default ClerkApp(AdminLayout, {
  localization: jaJP,
  appearance: {
    signIn: { elements: { footer: { display: 'none' } } },
  },
})
