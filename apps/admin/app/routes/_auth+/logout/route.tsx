import { SignOutButton } from '@clerk/react-router'
import { requireAdminUser } from '~/services/auth.server'
import type { Route } from './+types/route'

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireAdminUser(request)
}

export default function AdminLogoutPage() {
  return (
    <div>
      <header>signout</header>
      <SignOutButton />
    </div>
  )
}
