import { Link, useMatches, type UIMatch } from '@remix-run/react'
import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '~/components/ui'

type BreadcrumbMatch = UIMatch<
  Record<string, unknown>,
  { breadcrumb: (data: unknown) => JSX.Element }
>
export const Breadcrumbs = ({
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  const matches = (useMatches() as unknown as BreadcrumbMatch[]).filter(
    ({ handle }) => handle?.breadcrumb,
  )

  if (matches.length === 0) {
    return <></>
  }

  return (
    <Breadcrumb
      itemScope
      itemType="https://schema.org/BreadcrumbList"
      className="flex flex-wrap items-center gap-2.5 text-xs"
      {...props}
    >
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">東京</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {matches.map(({ handle, data, id }) => (
          <React.Fragment key={id}>
            <BreadcrumbSeparator />
            <BreadcrumbItem
              className="contents"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <BreadcrumbLink asChild>{handle.breadcrumb(data)}</BreadcrumbLink>
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
