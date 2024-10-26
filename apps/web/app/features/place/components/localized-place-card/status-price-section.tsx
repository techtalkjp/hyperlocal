import type { GooglePlacePriceLevel } from '@hyperlocal/google-place-api'
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
  businessStatusResult,
  priceLevel,
}) => (
  <HStack>
    <ClientOnly
      fallback={
        <span className="text-xs text-transparent md:text-sm">Status</span>
      }
    >
      {() => (
        <BusinessStatusBadge
          statusResult={businessStatusResult}
          className="text-sm"
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
