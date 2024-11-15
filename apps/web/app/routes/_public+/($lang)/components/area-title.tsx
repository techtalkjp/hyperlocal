import type { City, LanguageId } from '@hyperlocal/consts'
import { languages } from '@hyperlocal/consts'
import { Link, type UIMatch } from 'react-router';
import type React from 'react'

type AreaMatch = UIMatch<
  Record<string, unknown>,
  { area: (data: unknown) => JSX.Element }
>
interface AreaTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  city: City
  languageId: LanguageId
}
export const AreaTitle = ({ city, languageId, ...props }: AreaTitleProps) => {
  const language =
    languages.find((lang) => lang.id === languageId) ?? languages[0]

  return (
    <h1 className="flex flex-wrap items-end gap-x-2 text-xl font-bold">
      <Link to={`${language.path}`} prefetch="intent" viewTransition>
        Hyperlocal {city.i18n[languageId]}
      </Link>
    </h1>
  )
}
