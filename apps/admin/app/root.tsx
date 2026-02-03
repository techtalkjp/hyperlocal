import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  redirect,
} from 'react-router'
import type { Route } from './+types/root'
import { getSession } from './lib/auth-helpers.server'
import globalStyles from './styles/globals.css?url'

export const links: Route.LinksFunction = () => [
  { rel: 'stylesheet', href: globalStyles },
]

// Public routes that don't require authentication
const publicRoutes = ['/login', '/logout', '/signup']

const authMiddleware: Route.MiddlewareFunction = async (args) => {
  const url = new URL(args.request.url)
  const pathname = url.pathname

  // Skip auth check for public routes and API auth routes
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/auth')) {
    return
  }

  // Check authentication
  const session = await getSession(args.request)

  if (!session?.user) {
    return redirect('/login')
  }
}

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@600;700&display=swap"
          rel="stylesheet"
        />
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

export default function App() {
  return <Outlet />
}
