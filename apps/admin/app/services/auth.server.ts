import { getAuth } from '@clerk/react-router/ssr.server'
import { redirect } from 'react-router'

export const requireAdminUser = async (request: Request) => {
  const auth = await getAuth({ request, params: {}, context: {} })
  if (!auth.userId) {
    throw redirect('/login')
  }
  return auth
}
