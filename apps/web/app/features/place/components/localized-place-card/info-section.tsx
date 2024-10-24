import type { LocalizedPlace } from '@hyperlocal/db'
import React from 'react'
import { Stack } from '~/components/ui'
import type { getBusinessStatus } from '../../utils'
import { GenresSection } from './genre-sections'
import { RatingSection } from './rating-sections'
import { StatusPriceSection } from './status-price-section'

interface InfoSectionProps {
  place: LocalizedPlace
  distance?: number
  no?: number
  withOriginalName: boolean
  businessStatusResult: ReturnType<typeof getBusinessStatus>
}

export const InfoSection: React.FC<InfoSectionProps> = React.memo(
  ({ place, distance, no, withOriginalName, businessStatusResult }) => (
    <Stack className="gap-0.5 overflow-hidden">
      <div
        className="text-base font-semibold leading-none sm:text-xl md:text-2xl"
        style={{ viewTransitionName: `displayName-${place.placeId}` }}
      >
        {no && `${no}.`} {place.displayName}
      </div>

      <RatingSection place={place} />

      <GenresSection genres={place.genres} />

      <StatusPriceSection
        distance={distance}
        businessStatusResult={businessStatusResult}
        priceLevel={place.priceLevel ?? undefined}
      />
    </Stack>
  ),
)
