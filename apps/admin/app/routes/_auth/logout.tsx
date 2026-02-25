import { redirect } from 'react-router'

export const loader = () => {
  // ログアウトはクライアントサイドで signOut() を呼ぶ
  // このページにアクセスした場合はログインページにリダイレクト
  return redirect('/login')
}
