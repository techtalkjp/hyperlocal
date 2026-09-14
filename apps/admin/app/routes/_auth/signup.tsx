import { redirect } from 'react-router'

// Google ログインに一本化したため、登録専用ページは廃止。初回ログイン時に
// アカウントが自動作成される (作成自体は許可リストで制限)。
export const loader = () => {
  return redirect('/login')
}

export default function SignUpPage() {
  return null
}
