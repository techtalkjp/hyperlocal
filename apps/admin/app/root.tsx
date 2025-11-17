import { ClerkProvider } from '@clerk/react-router'
import {
  clerkMiddleware,
  getAuth,
  rootAuthLoader,
} from '@clerk/react-router/server'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  redirect,
} from 'react-router'
import type { Route } from './+types/root'
import globalStyles from './styles/globals.css?url'

export const links: Route.LinksFunction = () => [
  { rel: 'stylesheet', href: globalStyles },
]

// Public routes that don't require authentication
const publicRoutes = ['/login', '/logout']

const authMiddleware: Route.MiddlewareFunction = async (args) => {
  const url = new URL(args.request.url)
  const pathname = url.pathname

  // Skip auth check for public routes
  if (publicRoutes.includes(pathname)) {
    return
  }

  // Check authentication
  const auth = await getAuth(args)

  if (!('userId' in auth) || !auth.userId) {
    return redirect('/login')
  }
}

export const middleware: Route.MiddlewareFunction[] = [
  clerkMiddleware(),
  authMiddleware,
]

export const loader = async (args: Route.LoaderArgs) => {
  return await rootAuthLoader(args)
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <ClerkProvider loaderData={loaderData}>
      <Outlet />
    </ClerkProvider>
  )
}
