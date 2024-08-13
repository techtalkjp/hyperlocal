import { getAuth } from '@clerk/remix/ssr.server'
import { redirect } from '@remix-run/node'

export const requireAdminUser = async (request: Request) => {
  const userId = await getAdminUserId(request)
  if (userId === null) {
    throw redirect('/login')
  }
  return userId
}

export const getAdminUserId = async (request: Request) => {
  const user = await getAuth({ request, params: {}, context: {} })
  return user.userId
}
