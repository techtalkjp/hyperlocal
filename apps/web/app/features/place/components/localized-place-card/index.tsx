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
  to: string
}

export const LocalizedPlaceCard = ({
  place,
  distance,
  no,
  loading = 'eager',
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
        'text-card-foreground hover:bg-secondary relative grid grid-cols-1 rounded-md border p-0 text-sm hover:shadow-md sm:text-base md:text-lg',
        className,
      )}
    >
      <Link to={to} className="absolute inset-0 z-10" viewTransition />

      <div className="grid grid-cols-[auto_1fr] md:gap-4">
        <ImageSection place={place} loading={loading} />

        <Stack className="gap-1 p-2">
          <InfoSection
            place={place}
            no={no}
            businessStatusResult={businessStatusResult}
          />

          <ActionButtons place={place} distance={distance} className="z-20" />

          {distance && (
            <HStack className="text-sm font-semibold text-blue-500">
              {/* 距離 */}
              <div className="whitespace-nowrap">
                <MapPinIcon className="mr-1 mb-1 inline h-4 w-4" />
                {distance > 1000
                  ? `${(distance / 1000).toFixed(1)} km`
                  : `${distance.toFixed(0)} m`}
              </div>

              {/* 徒歩何分か。2キロ未満のときだけ表示 */}
              {distance < 2000 && (
                <div className="whitespace-nowrap">
                  <FootprintsIcon className="mr-1 mb-1 inline h-4 w-4" />
                  <span>{(distance / 80).toFixed(0)} min</span>
                </div>
              )}
            </HStack>
          )}
        </Stack>
      </div>

      <ReviewSection place={place} className="p-2" />
    </div>
  )
}
