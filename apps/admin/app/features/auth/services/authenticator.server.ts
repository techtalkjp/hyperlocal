import { createCookieSessionStorage } from 'react-router'
import { Authenticator } from 'remix-auth'
import type { SessionUser } from '../types/types'
import { strategy as GoogleStrategy } from './google-auth.server'

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV !== 'development',
  },
})

export const authenticator = new Authenticator<SessionUser>(sessionStorage)
authenticator.use(GoogleStrategy, 'google')
