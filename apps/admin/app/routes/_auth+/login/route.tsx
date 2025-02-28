import { SignIn } from '@clerk/react-router'
import { getAuth } from '@clerk/react-router/ssr.server'
import { redirect } from 'react-router'
import type { Route } from './+types/route'

export const loader = async (args: Route.LoaderArgs) => {
  const { userId } = await getAuth(args)
  if (userId) {
    return redirect('/')
  }
  return null
}

export default function AdminLoginPage() {
  return (
    <div className="grid h-dvh grid-cols-1 items-center justify-items-center">
      <SignIn />
    </div>
  )
}
