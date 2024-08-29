import { SignIn } from '@clerk/remix'
import { type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { getAdminUserId } from '~/services/auth.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getAdminUserId(request)
  if (userId) {
    return redirect('/admin')
  }
  return {}
}

export default function AdminLoginPage() {
  return (
    <div className="grid h-dvh grid-cols-1 items-center justify-items-center">
      <SignIn fallbackRedirectUrl="/admin" />
    </div>
  )
}
