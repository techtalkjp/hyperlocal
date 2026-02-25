import type { City, LanguageId } from '@hyperlocal/consts'
import { languages } from '@hyperlocal/consts'
import type React from 'react'
import { Link } from 'react-router'
import { cn } from '~/libs/utils'

interface AreaTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  city: City
  languageId: LanguageId
}
export const AreaTitle = ({
  city,
  languageId,
  className,
  ...props
}: AreaTitleProps) => {
  const language =
    languages.find((lang) => lang.id === languageId) ?? languages[0]

  return (
    <h1
      className={cn(
        'flex flex-wrap items-end gap-x-2 text-xl font-bold',
        className,
      )}
      {...props}
    >
      <Link to={`${language.path}`} prefetch="viewport" viewTransition>
        Hyperlocal {city.i18n[languageId]}
      </Link>
    </h1>
  )
}
