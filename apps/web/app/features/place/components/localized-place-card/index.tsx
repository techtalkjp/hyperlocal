import { cities } from '@hyperlocal/consts'
import type { LocalizedPlace } from '@hyperlocal/db'
import { Link } from '@remix-run/react'
import type { HStack } from '~/components/ui'
import dayjs from '~/libs/dayjs'
import { cn } from '~/libs/utils'
import { type BusinessHours, getBusinessStatus } from '../../utils'
import { ActionButtons } from './action-button'
import { ImageSection } from './image-section'
import { InfoSection } from './info-section'
import { ReviewSection } from './review-section'

interface PlaceCardProps extends React.ComponentProps<typeof HStack> {
  place: LocalizedPlace
  no?: number
  loading?: 'eager' | 'lazy'
  withOriginalName?: boolean
  to: string
}

export const LocalizedPlaceCard = ({
  place,
  no,
  loading = 'eager',
  withOriginalName = false,
  to,
  className,
}: PlaceCardProps) => {
  const city = cities.find((c) => c.cityId === place.cityId)
  const date = dayjs().utc().toDate()
  const businessStatusResult = getBusinessStatus(
    place.regularOpeningHours as BusinessHours | null,
    date,
    city?.timezone ?? 'Asia/Tokyo',
  )

  return (
    <div
      className={cn(
        'relative grid grid-cols-1 gap-y-4 rounded-md border p-2 text-sm text-card-foreground hover:bg-slate-50 hover:shadow-md sm:text-base md:text-lg',
        className,
      )}
    >
      <Link to={to} className="absolute inset-0 z-10" />
      <div className="relative grid grid-cols-[auto_1fr] gap-2 md:gap-4">
        <ImageSection place={place} loading={loading} />
        <div className="relative">
          <InfoSection
            place={place}
            no={no}
            withOriginalName={withOriginalName}
            businessStatusResult={businessStatusResult}
          />
          <ActionButtons place={place} className="relative z-10" />
        </div>
      </div>

      <ReviewSection place={place} />
    </div>
  )
}
