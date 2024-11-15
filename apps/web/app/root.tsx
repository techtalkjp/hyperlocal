import type { MetaFunction } from 'react-router';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from 'react-router';
import { PageLoadingProgress } from './components/page-loading-progress'
import { ThemeProvider } from './components/theme-provider'
import globalStyles from './styles/globals.css?url'

export const meta: MetaFunction = () => [
  { name: 'description', content: 'Hyperlocal' },
  { name: 'viewport', content: 'width=device-width, initial-scale=1' },
]

export const links = () => [{ rel: 'stylesheet', href: globalStyles }]

export const loader = () => {
  const env = {
    GA_TRACKING_ID: process.env.GA_TRACKING_ID,
    NODE_ENV: process.env.NODE_ENV,
  }
  return { env }
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
        <PageLoadingProgress />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

const App = () => {
  const { env } = useLoaderData<typeof loader>()

  return (
    <>
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
      <Outlet />
    </>
  )
}
export default App
