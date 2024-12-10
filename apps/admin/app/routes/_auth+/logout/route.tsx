import { SignOutButton } from '@clerk/react-router'
import { redirect } from 'react-router'
import { requireAdminUser } from '~/services/auth.server'
import type { Route } from './+types/route'

export const loader = async ({ request }: Route.LoaderArgs) => {
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
      <SignOutButton />
    </div>
  )
}
