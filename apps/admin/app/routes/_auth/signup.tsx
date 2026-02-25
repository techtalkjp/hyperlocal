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
import { signUp } from '~/lib/auth-client'
import { getSession } from '~/lib/auth-helpers.server'
import type { Route } from './+types/signup'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request)
  if (session?.user) {
    return redirect('/')
  }
  return null
}

const formSchema = z
  .object({
    name: z.string().min(1, '名前を入力してください'),
    email: z.email('有効なメールアドレスを入力してください'),
    password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
    confirmPassword: z.string().min(1, 'パスワード（確認）を入力してください'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

export default function SignUpPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [form, { name, email, password, confirmPassword }] = useForm({
    defaultValue: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
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
        const result = await signUp.email({
          name: submission.value.name,
          email: submission.value.email,
          password: submission.value.password,
        })

        if (result.error) {
          setServerError(result.error.message ?? '登録に失敗しました')
          setIsLoading(false)
          return
        }

        navigate('/')
      } catch {
        setServerError('登録に失敗しました')
        setIsLoading(false)
      }
    },
  })

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">アカウント登録</CardTitle>
          <CardDescription>新しいアカウントを作成します</CardDescription>
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
              <Label htmlFor={name.id}>名前</Label>
              <Input
                {...getInputProps(name, { type: 'text' })}
                placeholder="山田 太郎"
                disabled={isLoading}
              />
              <div
                id={name.errorId}
                className="text-destructive text-sm empty:hidden"
              >
                {name.errors}
              </div>
            </div>
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
            <div className="space-y-2">
              <Label htmlFor={confirmPassword.id}>パスワード（確認）</Label>
              <PasswordInput
                {...getInputProps(confirmPassword, { type: 'password' })}
                disabled={isLoading}
              />
              <div
                id={confirmPassword.errorId}
                className="text-destructive text-sm empty:hidden"
              >
                {confirmPassword.errors}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '登録中...' : '登録する'}
            </Button>
            <p className="text-muted-foreground text-center text-sm">
              すでにアカウントをお持ちですか？{' '}
              <Link to="/login" className="text-primary hover:underline">
                ログイン
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
