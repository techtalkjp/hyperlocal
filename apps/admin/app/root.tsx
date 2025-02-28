import { ClerkProvider } from '@clerk/react-router'
import { rootAuthLoader } from '@clerk/react-router/ssr.server'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import type { Route } from './+types/root'
import globalStyles from './styles/globals.css?url'

export const links: Route.LinksFunction = () => [
  { rel: 'stylesheet', href: globalStyles },
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
