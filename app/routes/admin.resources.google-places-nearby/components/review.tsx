import type React from 'react'
import { cn } from '~/libs/utils'

interface ReviewTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}
export const ReviewText = ({ children, className }: ReviewTextProps) => {
  return <div className={cn('line-clamp-3', className)}>{children}</div>
}
