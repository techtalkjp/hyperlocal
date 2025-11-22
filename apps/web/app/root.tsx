import { languages } from '@hyperlocal/consts'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router'
import type { Route } from './+types/root'
import { PageLoadingProgress } from './components/page-loading-progress'
import { ThemeProvider } from './components/theme-provider'
import { RouteErrorBoundary } from './features/error/components/route-error-boundary'
import { generateCanonicalLink } from './features/seo/canonical-url'
import './styles/globals.css'

export const meta: Route.MetaFunction = ({ location }) => [
  {
    name: 'description',
    content:
      'Discover top-rated restaurants and places in Tokyo. Real-time status, ratings, and instant guides for cafes, dining, and local spots across Tokyo.',
  },
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
  const data = useRouteLoaderData<typeof loader>('root')
  const lang = data?.lang?.id ?? 'en'

  return (
    <html lang={lang} suppressHydrationWarning>
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
        <PageLoadingProgress />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <ScrollRestoration
          getKey={(location) => {
            // リストページには location.pathname + location.search をキーとして使用
            // これにより、詳細ページから戻った時に同じキーとして認識され、スクロール位置が復元される
            return location.pathname + location.search
          }}
        />
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

export const ErrorBoundary = () => {
  // Try to get language from route loader data, fallback to 'en'
  const data = useRouteLoaderData<typeof loader>('root')
  const languageId = data?.lang?.id ?? 'en'

  return (
    <html lang={languageId} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <RouteErrorBoundary languageId={languageId} />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
