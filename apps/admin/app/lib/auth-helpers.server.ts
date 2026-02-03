import { redirect } from 'react-router'
import { auth } from './auth'

type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>

/**
 * セッションを取得（未認証ならnull）
 */
export async function getSession(request: Request) {
  return await auth.api.getSession({ headers: request.headers })
}

/**
 * 認証必須。未認証なら /login へリダイレクト
 */
export async function requireAuth(request: Request): Promise<AuthSession> {
  const session = await getSession(request)
  if (!session?.user) {
    throw redirect('/login')
  }
  return session
}

/**
 * 管理者権限必須。未認証 or 非管理者ならリダイレクト
 */
export async function requireAdmin(request: Request): Promise<AuthSession> {
  const session = await requireAuth(request)
  if (session.user.role !== 'admin') {
    throw redirect('/')
  }
  return session
}
