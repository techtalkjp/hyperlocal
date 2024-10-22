import type { LoaderFunctionArgs } from '@remix-run/node'
import {
  Link,
  type MetaFunction,
  Outlet,
  useLoaderData,
} from '@remix-run/react'
import { getLangCityAreaCategory } from '~/features/city-area/utils'
import { AreaTitle, Breadcrumbs, LanguageSelect } from './components'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: `Hyperlocal ${data?.city.i18n[data.lang.id]}`,
  },
]

export const shouldRevalidate = () => true

export const loader = ({ request, params }: LoaderFunctionArgs) => {
  const { city, area, lang } = getLangCityAreaCategory(request, params)
  return { city, area, lang }
}

export default function PublicLayout() {
  const { city, area, lang } = useLoaderData<typeof loader>()

  return (
    <div>
      <header>
        <div className="flex items-center border-b px-2 py-2">
          <AreaTitle city={city} languageId={lang.id} />
          <div className="flex-1" />
          <LanguageSelect
            currentLanguageId={lang.id}
            className="flex-shrink-0"
          />
        </div>

        {area && (
          <nav className="px-2 pt-2">
            <Breadcrumbs>
              <Link to={`/${lang.path}`}>{city.i18n[lang.id]}</Link>
            </Breadcrumbs>
          </nav>
        )}
      </header>

      <main className="px-0.5 py-2">
        <Outlet />
      </main>
    </div>
  )
}
