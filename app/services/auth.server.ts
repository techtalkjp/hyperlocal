import { getAuth } from '@clerk/remix/ssr.server'
import { redirect } from '@remix-run/node'

export const requireUser = async (request: Request) => {
  const user = await getAuth({ request, params: {}, context: {} })
  if (user.userId === null) {
    throw redirect('/')
  }
}
