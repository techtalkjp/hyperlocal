import { SignOutButton, UserProfile } from '@clerk/remix'
import { type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { requireAdminUser } from '~/services/auth.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireAdminUser(request)
  if (!userId) {
    return redirect('/admin/login')
  }
  return {}
}

export default function AdminLogoutPage() {
  return (
    <div>
      <header>
        <UserProfile />
      </header>
      <SignOutButton />
    </div>
  )
}
