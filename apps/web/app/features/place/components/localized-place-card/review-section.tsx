import type { LocalizedPlace } from '@hyperlocal/db'
import { MessageSquareIcon } from 'lucide-react'
import React from 'react'
import { HStack } from '~/components/ui'

interface ReviewSectionProps {
  place: LocalizedPlace
}

export const ReviewSection: React.FC<ReviewSectionProps> = React.memo(
  ({ place }) => (
    <div className="relative">
      {place.reviews[0]?.text && (
        <HStack className="items-start text-muted-foreground">
          <MessageSquareIcon className="mt-0.5 h-3 w-3 flex-shrink-0 sm:mt-1 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          <div className="line-clamp-3">"{place.reviews[0].text}"</div>
        </HStack>
      )}
      {/* 「Read more...」リンクはカード全体がリンクになっているため不要です。必要に応じて削除してください。 */}
    </div>
  ),
)
