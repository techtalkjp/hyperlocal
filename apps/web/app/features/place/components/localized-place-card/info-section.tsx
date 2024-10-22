import type { LocalizedPlace } from '@hyperlocal/db'
import React from 'react'
import type { getBusinessStatus } from '../../utils'
import { GenresSection } from './genre-sections'
import { RatingSection } from './rating-sections'
import { StatusPriceSection } from './status-price-section'

interface InfoSectionProps {
  place: LocalizedPlace
  no?: number
  withOriginalName: boolean
  businessStatusResult: ReturnType<typeof getBusinessStatus>
}

export const InfoSection: React.FC<InfoSectionProps> = React.memo(
  ({ place, no, withOriginalName, businessStatusResult }) => (
    <div className="overflow-hidden">
      <div className="text-base font-semibold sm:text-xl md:text-2xl">
        {no && `${no}.`} {place.displayName}
      </div>

      {withOriginalName && (
        <div className="text-xs leading-none text-muted-foreground">
          {place.originalDisplayName}
        </div>
      )}

      <RatingSection place={place} />

      <GenresSection genres={place.genres} />

      <StatusPriceSection
        businessStatusResult={businessStatusResult}
        priceLevel={place.priceLevel ?? undefined}
      />
    </div>
  ),
)
