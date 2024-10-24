import { useMatches, type UIMatch } from '@remix-run/react'
import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '~/components/ui'

type BreadcrumbMatch = UIMatch<
  Record<string, unknown>,
  { breadcrumb: (data: unknown) => JSX.Element }
>
export const Breadcrumbs = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  const matches = (useMatches() as unknown as BreadcrumbMatch[]).filter(
    ({ handle }) => handle?.breadcrumb,
  )

  return (
    <Breadcrumb
      itemScope
      itemType="https://schema.org/BreadcrumbList"
      className="flex flex-wrap items-center gap-2.5 text-xs"
      {...props}
    >
      <BreadcrumbList>
        {matches.map(({ handle, data, id }, index) => (
          <React.Fragment key={id}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem
              className="contents"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {handle.breadcrumb(data)}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
