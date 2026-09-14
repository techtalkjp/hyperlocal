import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'react-router'
import type { Route } from './+types/root'
import { requireAdmin } from './lib/auth-helpers.server'
import { getEnv } from './lib/request-context'
import globalStyles from './styles/globals.css?url'

export const links: Route.LinksFunction = () => [
  { rel: 'stylesheet', href: globalStyles },
]

export const loader = ({ context }: Route.LoaderArgs) => {
  const env = getEnv(context)
  return {
    ENV: {
      BETTER_AUTH_URL: env.BETTER_AUTH_URL ?? 'http://localhost:5175',
    },
  }
}

// Public routes that don't require authentication
const publicRoutes = ['/login', '/logout', '/signup']

const authMiddleware: Route.MiddlewareFunction = async (args) => {
  const url = new URL(args.request.url)
  const pathname = url.pathname

  // Skip auth check for public routes and API auth routes
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/auth')) {
    return
  }

  // Check authentication (admin-only; creation is allowlisted in auth.ts)
  await requireAdmin(args.request, getEnv(args.context))
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
  const { ENV } = useLoaderData<typeof loader>()
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(ENV)}`,
        }}
      />
      <Outlet />
    </>
  )
}
