import { jaJP } from '@clerk/localizations'
import { ClerkApp } from '@clerk/remix'
import { rootAuthLoader } from '@clerk/remix/ssr.server'
import type { LoaderFunctionArgs } from '@remix-run/node'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import globalStyles from './styles/globals.css?url'

export const links = () => [
  {
    rel: 'stylesheet',
    href: globalStyles,
  },
]

export const loader = (args: LoaderFunctionArgs) => {
  return rootAuthLoader(args)
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

const App = () => {
  return <Outlet />
}

export default ClerkApp(App, { localization: jaJP })
