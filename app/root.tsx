import { jaJP } from '@clerk/localizations'
import { ClerkApp } from '@clerk/remix'
import { rootAuthLoader } from '@clerk/remix/ssr.server'
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import globalStyles from './styles/globals.css?url'

export const meta: MetaFunction = () => [
  { name: 'description', content: 'Hyperlocal' },
  { name: 'viewport', content: 'width=device-width, initial-scale=1' },
]

export const links = () => [{ rel: 'stylesheet', href: globalStyles }]

export const loader = (args: LoaderFunctionArgs) => {
  return rootAuthLoader(args, () => {
    const env = {
      GA_TRACKING_ID: process.env.GA_TRACKING_ID,
      NODE_ENV: process.env.NODE_ENV,
    }
    return { env }
  })
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { env } = useLoaderData<typeof loader>()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {env.NODE_ENV === 'production' && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${env.GA_TRACKING_ID}`}
            />
            <script
              async
              id="gtag-init"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${env.GA_TRACKING_ID}');
              `,
              }}
            />
          </>
        )}

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

export default ClerkApp(App, {
  localization: jaJP,
  appearance: {
    signIn: { elements: { footer: { display: 'none' } } },
  },
})
