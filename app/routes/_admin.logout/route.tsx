import { SignedIn, SignOutButton, UserProfile } from '@clerk/remix'
import { type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { requireAdminUser } from '~/services/auth.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireAdminUser(request)
  console.log('logout', userId)
  if (!userId) {
    return redirect('/login')
  }
  return {}
}

export default function IndexPage() {
  return (
    <div>
      <header>
        <UserProfile />
      </header>
      <h1>Logout</h1>
      <SignedIn>
        <SignOutButton />
      </SignedIn>
    </div>
  )
}
