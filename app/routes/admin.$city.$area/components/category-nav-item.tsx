import { NavLink } from '@remix-run/react'
import { twc } from 'react-twc'

export const CategoryNav = twc.div`flex flex-row flex-nowrap overflow-auto`
export const CategoryNavItem = twc(
  NavLink,
)`flex-shrink-0 bg-muted px-2 aria-[current]:bg-card text-muted-foreground aria-[current]:text-primary hover:text-primary aria-[current]:underline underline-offset-4 decoration-8 aria-[current]:border-t aria-[current]:border-x aria-[current]:rounded-t`
