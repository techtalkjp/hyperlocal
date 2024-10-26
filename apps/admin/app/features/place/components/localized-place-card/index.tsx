import { UTCDate } from '@date-fns/utc'
import { cities } from '@hyperlocal/consts'
import type { LocalizedPlace } from '@hyperlocal/db'
import { FootprintsIcon, MapPinIcon } from 'lucide-react'
import { Link } from 'react-router'
import { HStack, Stack } from '~/components/ui'
import { cn } from '~/libs/utils'
import { getBusinessStatus, type BusinessHours } from '../../utils'
import { ActionButtons } from './action-button'
import { ImageSection } from './image-section'
import { InfoSection } from './info-section'
import { ReviewSection } from './review-section'

interface PlaceCardProps extends React.ComponentProps<typeof HStack> {
  place: LocalizedPlace
  distance?: number
  no?: number
  loading?: 'eager' | 'lazy'
  withOriginalName?: boolean
  to: string
}

export const LocalizedPlaceCard = ({
  place,
  distance,
  no,
  loading = 'eager',
  withOriginalName = false,
  to,
  className,
}: PlaceCardProps) => {
  const city = cities.find((c) => c.cityId === place.cityId)
  const date = new UTCDate()
  const businessStatusResult = getBusinessStatus(
    place.regularOpeningHours as BusinessHours | null,
    date,
    city?.timezone ?? 'Asia/Tokyo',
  )

  return (
    <div
      className={cn(
        'text-card-foreground relative grid grid-cols-1 rounded-md border p-0 text-sm hover:bg-slate-50 hover:shadow-md sm:text-base md:text-lg',
        className,
      )}
    >
      <Link
        to={to}
        className="absolute inset-0 z-10"
        viewTransition
        prefetch="viewport"
      />

      <div className="grid grid-cols-[auto_1fr] md:gap-4">
        <ImageSection place={place} loading={loading} />

        <Stack className="gap-1 p-2">
          <InfoSection
            place={place}
            no={no}
            withOriginalName={withOriginalName}
            businessStatusResult={businessStatusResult}
          />

          <ActionButtons place={place} distance={distance} className="z-20" />

          {distance && (
            <HStack>
              {/* 距離 */}
              <div className="whitespace-nowrap text-sm font-semibold text-blue-500">
                <MapPinIcon className="mb-1 mr-1 inline h-4 w-4" />
                {distance > 1000
                  ? `${(distance / 1000).toFixed(1)} km`
                  : `${distance.toFixed(0)} m`}
              </div>

              {/* 徒歩何分か。10キロ未満のときだけ表示 */}
              <div className="whitespace-nowrap text-sm font-semibold text-blue-500">
                <FootprintsIcon className="mb-1 mr-1 inline h-4 w-4" />
                <span>
                  {distance > 10000 ? '' : `${(distance / 80).toFixed(0)} min`}
                </span>
              </div>
            </HStack>
          )}
        </Stack>
      </div>

      <ReviewSection place={place} className="p-2" />
    </div>
  )
}
