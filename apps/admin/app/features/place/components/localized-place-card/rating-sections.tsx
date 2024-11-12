import type { LocalizedPlace } from '@hyperlocal/db/src/types'
import React from 'react'
import { HStack } from '~/components/ui'
import { Rating } from '~/features/place/components/rating'

interface RatingSectionProps {
  place: LocalizedPlace
}

export const RatingSection: React.FC<RatingSectionProps> = React.memo(
  ({ place }) => (
    <HStack>
      <Rating star={place.rating} withLabel size={16} />
      <div className="whitespace-nowrap text-xs text-muted-foreground">
        ({place.userRatingCount} reviews)
      </div>
    </HStack>
  ),
)
