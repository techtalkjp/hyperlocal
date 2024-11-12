import { GoogleStrategy } from '@coji/remix-auth-google'
import { verifyUser } from './verify-user.server'

const getGoogleStrategy = () => {
  return new GoogleStrategy(
    {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectURI: `${process.env.NODE_ENV === 'development' ? 'http://localhost:5175' : 'https://hyperlocal-admin.techtalkjp.workers.dev'}/auth/google/callback`,
    },
    verifyUser,
  )
}

export const strategy = new Proxy<ReturnType<typeof getGoogleStrategy>>(
  {} as never,
  {
    get(target: unknown, props: keyof ReturnType<typeof getGoogleStrategy>) {
      const instance = getGoogleStrategy()
      const value = instance[props]
      if (typeof value === 'function') {
        return value.bind(instance)
      }
      return value
    },
  },
)
