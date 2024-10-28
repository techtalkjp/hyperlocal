import type { City, LanguageId } from '@hyperlocal/consts'
import { Link, useMatches, type UIMatch } from '@remix-run/react'
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
  const matches = (useMatches() as unknown as AreaMatch[]).find(
    ({ handle }) => handle?.area,
  )

  const area = matches?.handle.area(matches.data)

  return (
    <h1 className="flex flex-wrap items-end gap-x-2 text-xl font-bold">
      <Link to={`/${languageId === 'en' ? '' : languageId}`} prefetch="intent">
        Hyperlocal {city.i18n[languageId]}{' '}
      </Link>
      {/* <div className="text-sm text-muted-foreground">{area}</div> */}
    </h1>
  )
}
