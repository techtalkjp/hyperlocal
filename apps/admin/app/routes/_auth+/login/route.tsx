import { GoogleLoginButton } from '~/features/auth/components/GoogleLoginButton'

export default function AdminLoginPage() {
  return (
    <div className="grid h-dvh grid-cols-1 items-center justify-items-center">
      <GoogleLoginButton />
    </div>
  )
}
