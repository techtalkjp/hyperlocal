import type { LocalizedPlace } from '@hyperlocal/db'
import type React from 'react'
import { Stack } from '~/components/ui'
import type { getBusinessStatus } from '../../utils'
import { GenresSection } from './genre-sections'
import { RatingSection } from './rating-sections'
import { StatusPriceSection } from './status-price-section'

interface InfoSectionProps {
  place: LocalizedPlace
  no?: number
  businessStatusResult: ReturnType<typeof getBusinessStatus>
}

export const InfoSection: React.FC<InfoSectionProps> = ({
  place,
  no,
  businessStatusResult,
}) => (
  <Stack className="gap-0.5 overflow-hidden">
    <div
      className="text-base leading-none font-semibold sm:text-xl md:text-2xl"
      style={{ viewTransitionName: `displayName-${place.placeId}` }}
    >
      {no && `${no}.`} {place.displayName}
    </div>

    <RatingSection place={place} />

    <GenresSection genres={place.genres} />

    <StatusPriceSection
      businessStatusResult={businessStatusResult}
      priceLevel={place.priceLevel ?? undefined}
    />
  </Stack>
)
