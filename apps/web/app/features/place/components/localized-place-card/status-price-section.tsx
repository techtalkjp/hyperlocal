import type { GooglePlacePriceLevel } from '@hyperlocal/google-place-api'
import React from 'react'
import { ClientOnly } from 'remix-utils/client-only'
import { HStack } from '~/components/ui'
import { BusinessStatusBadge } from '..'
import { type getBusinessStatus, priceLevelLabel } from '../../utils'

interface StatusPriceSectionProps {
  businessStatusResult: ReturnType<typeof getBusinessStatus>
  priceLevel?: GooglePlacePriceLevel
}

export const StatusPriceSection: React.FC<StatusPriceSectionProps> = React.memo(
  ({ businessStatusResult, priceLevel }) => (
    <HStack>
      <ClientOnly
        fallback={
          <span className="px-1 py-0.5 text-sm text-transparent">Status</span>
        }
      >
        {() => <BusinessStatusBadge statusResult={businessStatusResult} />}
      </ClientOnly>

      <div className="flex-1" />

      {priceLevel && (
        <div className="flex-shrink-0 text-muted-foreground">
          {priceLevelLabel(priceLevel)}
        </div>
      )}
    </HStack>
  ),
)
