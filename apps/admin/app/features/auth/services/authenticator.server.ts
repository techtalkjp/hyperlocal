import { createCookieSessionStorage } from 'react-router'
import { Authenticator } from 'remix-auth'
import type { SessionUser } from '../types'
import { strategy as GoogleStrategy } from './google-auth.server'

const getSessionStorage = () => {
  const sessionStorage = createCookieSessionStorage({
    cookie: {
      name: '__session',
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secrets: [process.env.SESSION_SECRET],
      secure: process.env.NODE_ENV !== 'development',
    },
  })

  return sessionStorage
}
export const sessionStorage = new Proxy<ReturnType<typeof getSessionStorage>>(
  {} as never,
  {
    get(target: unknown, props: keyof ReturnType<typeof getSessionStorage>) {
      const instance = getSessionStorage()
      const value = instance[props]
      if (typeof value === 'function') {
        return value.bind(instance)
      }
      return value
    },
  },
)

const getAuthenticator = () => {
  const authenticator = new Authenticator<SessionUser>(getSessionStorage())
  return authenticator.use(GoogleStrategy, 'google')
}
export const authenticator = new Proxy<ReturnType<typeof getAuthenticator>>(
  {} as never,
  {
    get(target: unknown, props: keyof ReturnType<typeof getAuthenticator>) {
      const instance = getAuthenticator()
      const value = instance[props]
      if (typeof value === 'function') {
        return value.bind(instance)
      }
      return value
    },
  },
)
