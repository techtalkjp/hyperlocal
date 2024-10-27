import { NavLink } from '@remix-run/react'
import { twc } from 'react-twc'

export const CategoryNav = twc.div`flex flex-nowrap overflow-auto text-sm gap-2`
export const CategoryNavItem = twc(
  NavLink,
)`flex-shrink-0 text-muted-foreground aria-[current]:text-primary hover:text-primary aria-[current]:underline underline-offset-4 decoration-2`
