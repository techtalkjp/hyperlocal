import { Link, useMatches, type UIMatch } from '@remix-run/react'
import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
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
            <Link to="/">Hyperlocal</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {matches.map(({ handle, data, id }, i) => (
          <React.Fragment key={id}>
            <BreadcrumbItem
              className="contents"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <BreadcrumbSeparator />
              <BreadcrumbPage>{handle.breadcrumb(data)}</BreadcrumbPage>
              {/* {i > 0 && <span className="text-sm">/</span>}
              <meta itemProp="position" content={`${i + 1}`} /> */}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
