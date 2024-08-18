import { useMatches, type UIMatch } from '@remix-run/react'
import type React from 'react'

type AreaMatch = UIMatch<
  Record<string, unknown>,
  { area: (data: unknown) => JSX.Element }
>
export const AreaTitle = ({ ...props }: React.HTMLAttributes<HTMLElement>) => {
  const matches = (useMatches() as unknown as AreaMatch[]).find(
    ({ handle }) => handle?.area,
  )

  return (
    <h1 className="text-xl font-bold">
      Hyperlocal {matches?.handle.area(matches.data)}
    </h1>
  )
}
