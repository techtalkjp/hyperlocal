import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod/v4'
import { useState } from 'react'
import { Link, redirect, useNavigate } from 'react-router'
import { z } from 'zod'
import { PasswordInput } from '~/components/password-input'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { signIn } from '~/lib/auth-client'
import { getSession } from '~/lib/auth-helpers.server'
import type { Route } from './+types/login'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request)
  if (session?.user) {
    return redirect('/')
  }
  return null
}

const formSchema = z.object({
  email: z.email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [form, { email, password }] = useForm({
    defaultValue: {
      email: '',
      password: '',
    },
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: formSchema }),
    shouldRevalidate: 'onBlur',
    onSubmit: async (event, { submission }) => {
      event.preventDefault()
      if (submission?.status !== 'success') {
        return
      }

      setServerError(null)
      setIsLoading(true)

      try {
        const result = await signIn.email({
          email: submission.value.email,
          password: submission.value.password,
        })

        if (result.error) {
          setServerError(result.error.message ?? 'ログインに失敗しました')
          setIsLoading(false)
          return
        }

        navigate('/')
      } catch {
        setServerError('ログインに失敗しました')
        setIsLoading(false)
      }
    },
  })

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ログイン</CardTitle>
          <CardDescription>
            メールアドレスとパスワードでログイン
          </CardDescription>
        </CardHeader>
        <form {...getFormProps(form)}>
          <CardContent className="space-y-4">
            {serverError && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {serverError}
              </div>
            )}
            {form.errors && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {form.errors}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor={email.id}>メールアドレス</Label>
              <Input
                {...getInputProps(email, { type: 'email' })}
                placeholder="you@example.com"
                disabled={isLoading}
              />
              <div
                id={email.errorId}
                className="text-destructive text-sm empty:hidden"
              >
                {email.errors}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={password.id}>パスワード</Label>
              <PasswordInput
                {...getInputProps(password, { type: 'password' })}
                disabled={isLoading}
              />
              <div
                id={password.errorId}
                className="text-destructive text-sm empty:hidden"
              >
                {password.errors}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card text-muted-foreground px-2">
                  または
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading}
              onClick={() => signIn.social({ provider: 'google' })}
            >
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google でログイン
            </Button>

            <p className="text-muted-foreground text-center text-sm">
              アカウントをお持ちでないですか？{' '}
              <Link to="/signup" className="text-primary hover:underline">
                登録する
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
