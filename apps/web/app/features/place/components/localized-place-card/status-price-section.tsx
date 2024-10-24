import type { GooglePlacePriceLevel } from '@hyperlocal/google-place-api'
import { MapPinIcon } from 'lucide-react'
import type React from 'react'
import { ClientOnly } from 'remix-utils/client-only'
import { HStack } from '~/components/ui'
import { BusinessStatusBadge } from '..'
import { type getBusinessStatus, priceLevelLabel } from '../../utils'

interface StatusPriceSectionProps {
  distance?: number
  businessStatusResult: ReturnType<typeof getBusinessStatus>
  priceLevel?: GooglePlacePriceLevel
}

export const StatusPriceSection: React.FC<StatusPriceSectionProps> = ({
  distance,
  businessStatusResult,
  priceLevel,
}) => (
  <HStack className="gap-0">
    {distance && (
      <span className="text-xs text-muted-foreground md:text-sm">
        <MapPinIcon className="mb-1 mr-1 inline h-4 w-4" />
        {distance > 1000
          ? `${(distance / 1000).toFixed(1)} km`
          : `${distance.toFixed(0)} m`}
        <span className="mx-0.5 text-muted-foreground">⋅</span>
      </span>
    )}
    <ClientOnly
      fallback={
        <span className="text-xs text-transparent md:text-sm">Status</span>
      }
    >
      {() => (
        <BusinessStatusBadge
          statusResult={businessStatusResult}
          className="text-xs md:text-sm"
        />
      )}
    </ClientOnly>
    <div className="flex-1" />
    {priceLevel && (
      <div className="flex-shrink-0 text-muted-foreground">
        {priceLevelLabel(priceLevel)}
      </div>
    )}
  </HStack>
)
