import { type LoaderFunctionArgs, redirect } from 'react-router'
import {
  authenticator,
  sessionStorage,
} from '~/features/auth/services/authenticator.server'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const user = await authenticator.authenticate('google', request, {
    failureRedirect: '/login',
    context,
  })

  // ログイン成功時にセッションを保存
  const session = await sessionStorage.getSession(request.headers.get('cookie'))
  session.set(authenticator.sessionKey, user)
  const headers = new Headers({
    'Set-Cookie': await sessionStorage.commitSession(session),
  })

  return redirect('/', { headers })
}
