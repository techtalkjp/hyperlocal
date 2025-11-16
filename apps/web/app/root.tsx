import { languages } from '@hyperlocal/consts'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import type { Route } from './+types/root'
import { PageLoadingProgress } from './components/page-loading-progress'
import { ThemeProvider } from './components/theme-provider'
import { generateCanonicalLink } from './features/seo/canonical-url'
import './styles/globals.css'

export const meta: Route.MetaFunction = ({ location }) => [
  { name: 'description', content: 'Hyperlocal' },
  { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  generateCanonicalLink(location.pathname),
]

export const shouldRevalidate = () => true

export const loader = ({ params }: Route.LoaderArgs) => {
  const { lang: langId } = params
  const lang = languages.find((lang) => lang.id === langId) ?? languages[0]
  const env = {
    GA_TRACKING_ID: process.env.GA_TRACKING_ID,
    NODE_ENV: process.env.NODE_ENV,
  }
  return { lang, env }
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
          defaultTheme="dark"
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

const App = ({ loaderData: { env } }: Route.ComponentProps) => {
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
