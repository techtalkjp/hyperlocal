import { type LoaderFunctionArgs, redirect } from 'react-router'
import { requireAdminUser } from '~/features/auth/services/user-session.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireAdminUser(request)
  if (!userId) {
    return redirect('/login')
  }
  return {}
}

export default function AdminLogoutPage() {
  return (
    <div>
      <header>signout</header>
    </div>
  )
}
