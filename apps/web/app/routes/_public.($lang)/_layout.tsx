import { cities, languages } from '@hyperlocal/consts'
import { Outlet } from 'react-router'
import { SiteFooter } from '~/components/site-footer'
import { SiteHeader } from '~/components/site-header'
import { generateCanonicalLink } from '~/features/seo/canonical-url'
import type { Route } from './+types/_layout'

export const meta: Route.MetaFunction = ({ loaderData, location }) => {
  if (!loaderData) return []

  return [
    {
      title: `Hyperlocal ${loaderData.city.i18n[loaderData.lang.id]}`,
    },
    generateCanonicalLink(location.pathname),
  ]
}

export const shouldRevalidate = () => true

export const clientLoader = ({ params }: Route.ClientLoaderArgs) => {
  const lang =
    params.lang === undefined
      ? languages[0]
      : languages.find((l) => l.id === params.lang)
  if (!lang) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const city = cities[0]
  return { city, lang }
}

export default function PublicLayout({
  loaderData: { city, lang },
}: Route.ComponentProps) {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
      <SiteHeader city={city} languageId={lang.id} />

      <main className="px-1 py-2 sm:px-4 md:px-6">
        <Outlet />
      </main>

      <SiteFooter languageId={lang.id} />
    </div>
  )
}
