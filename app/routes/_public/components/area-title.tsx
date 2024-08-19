import { Link, useMatches, type UIMatch } from '@remix-run/react'
import type React from 'react'

type AreaMatch = UIMatch<
  Record<string, unknown>,
  { area: (data: unknown) => JSX.Element }
>
export const AreaTitle = ({ ...props }: React.HTMLAttributes<HTMLElement>) => {
  const matches = (useMatches() as unknown as AreaMatch[]).find(
    ({ handle }) => handle?.area,
  )

  const area = matches?.handle.area(matches.data)

  return (
    <h1 className="text-xl font-bold">
      <Link to="/">
        Hyperlocal Tokyo <small>{area}</small>
      </Link>
    </h1>
  )
}
