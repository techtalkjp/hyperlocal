import { NavLink } from 'react-router'
import { twc } from 'react-twc'

export const CategoryNav = twc.div`flex flex-nowrap overflow-auto hidden-scrollbar gap-2`
export const CategoryNavItem = twc(
  NavLink,
)`flex-shrink-0 pr-1 text-muted-foreground aria-[current]:text-primary hover:text-primary aria-[current]:underline underline-offset-4 decoration-2`
