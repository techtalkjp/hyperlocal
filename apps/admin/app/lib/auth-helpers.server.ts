import { redirect } from "react-router";
import { createAuth } from "./auth";
import type { AdminEnv } from "./request-context";

type AuthSession = NonNullable<
  Awaited<ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>>
>;

/**
 * セッションを取得（未認証ならnull）
 */
export async function getSession(request: Request, env: AdminEnv) {
  return await createAuth(env).api.getSession({ headers: request.headers });
}

/**
 * 認証必須。未認証なら /login へリダイレクト
 */
export async function requireAuth(request: Request, env: AdminEnv): Promise<AuthSession> {
  const session = await getSession(request, env);
  if (!session?.user) {
    throw redirect("/login");
  }
  return session;
}

/**
 * 管理者権限必須。未認証 or 非管理者ならリダイレクト
 */
export async function requireAdmin(request: Request, env: AdminEnv): Promise<AuthSession> {
  const session = await requireAuth(request, env);
  if (session.user.role !== "admin") {
    throw redirect("/");
  }
  return session;
}
