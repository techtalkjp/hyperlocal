import { getAuth } from '@clerk/react-router/ssr.server'
import { redirect } from 'react-router'

export const requireAdminUser = async (request: Request) => {
  const auth = await getAuth({
    request,
    params: {},
    context: {},
    unstable_pattern: '*',
  })
  if (!auth.isAuthenticated) {
    throw redirect('/login')
  }
  return auth
}
