import { Link, useMatches, type UIMatch } from '@remix-run/react'
import type React from 'react'
import type cities from '~/assets/cities.json'

type AreaMatch = UIMatch<
  Record<string, unknown>,
  { area: (data: unknown) => JSX.Element }
>
interface AreaTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  city: (typeof cities)[number]
}
export const AreaTitle = ({ city, ...props }: AreaTitleProps) => {
  const matches = (useMatches() as unknown as AreaMatch[]).find(
    ({ handle }) => handle?.area,
  )

  const area = matches?.handle.area(matches.data)

  return (
    <h1 className="text-xl font-bold">
      <Link to="/">
        Hyperlocal {city.i18n.en} <small>{area}</small>
      </Link>
    </h1>
  )
}
