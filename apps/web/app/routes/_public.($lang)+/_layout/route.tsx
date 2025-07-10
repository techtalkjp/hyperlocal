import { Outlet } from 'react-router'
import { HStack } from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'
import { generateCanonicalLink } from '~/features/seo/canonical-url'
import { NearbyAreasSelector } from '~/routes/resources+/nearby-areas/route'
import type { Route } from './+types/route'
import { AreaTitle, LanguageSelect } from './components'

export const meta: Route.MetaFunction = ({ data, location }) => {
  if (!data) return []

  return [
    {
      title: `Hyperlocal ${data.city.i18n[data.lang.id]}`,
    },
    generateCanonicalLink(location.pathname),
  ]
}

export const shouldRevalidate = () => true

export const loader = ({ request, params }: Route.LoaderArgs) => {
  const { city, lang } = getPathParams(request, params)
  return { city, lang }
}

export default function PublicLayout({
  loaderData: { city, lang },
}: Route.ComponentProps) {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
      <header className="flex items-center border-b px-2 py-2 sm:px-4 md:px-6">
        <AreaTitle city={city} languageId={lang.id} />
        <div className="flex-1" />
        <HStack>
          <LanguageSelect currentLanguageId={lang.id} />
          <NearbyAreasSelector languageId={lang.id} />
        </HStack>
      </header>

      <main className="px-1 py-2 sm:px-4 md:px-6">
        <Outlet />
      </main>

      <footer className="flex items-center border-t px-2 py-2 sm:px-4 md:px-6">
        <div>
          <p className="text-sm">
            © {new Date().getFullYear()}{' '}
            <a href="/" className="underline">
              Hyperlocal
            </a>
          </p>
        </div>
        <div className="flex-1" />
        <LanguageSelect currentLanguageId={lang.id}>Language</LanguageSelect>
      </footer>
    </div>
  )
}
