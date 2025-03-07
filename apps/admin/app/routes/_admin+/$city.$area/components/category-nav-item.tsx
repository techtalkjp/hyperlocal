import { NavLink } from 'react-router'
import { twc } from 'react-twc'

export const CategoryNav = twc.div`flex flex-row flex-nowrap overflow-auto`
export const CategoryNavItem = twc(
  NavLink,
)`shrink-0 px-2 text-muted-foreground aria-[current]:text-primary hover:text-primary aria-[current]:underline underline-offset-4 decoration-2`
