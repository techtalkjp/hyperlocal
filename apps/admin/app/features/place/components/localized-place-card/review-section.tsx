import type { LocalizedPlace } from '@hyperlocal/db/src/types'
import { MessageSquareIcon } from 'lucide-react'
import React from 'react'
import { HStack } from '~/components/ui'
import { cn } from '~/libs/utils'

interface ReviewSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  place: LocalizedPlace
}

export const ReviewSection: React.FC<ReviewSectionProps> = React.memo(
  ({ place, className }) => (
    <div className={cn(className)}>
      {place.reviews[0]?.text && (
        <HStack className="text-muted-foreground items-start">
          <MessageSquareIcon className="mt-0.5 h-3 w-3 shrink-0 sm:mt-1 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          <div className="line-clamp-3">"{place.reviews[0].text}"</div>
        </HStack>
      )}
      {/* 「Read more...」リンクはカード全体がリンクになっているため不要です。必要に応じて削除してください。 */}
    </div>
  ),
)
