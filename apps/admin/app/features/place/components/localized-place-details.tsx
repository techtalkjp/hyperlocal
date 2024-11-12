import { UTCDate } from '@date-fns/utc'
import { areas, cities, languages } from '@hyperlocal/consts'
import type { LocalizedPlace } from '@hyperlocal/db/src/types'
import { ExternalLink, MapIcon, MapPin, Star } from 'lucide-react'
import { ClientOnly } from 'remix-utils/client-only'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  HStack,
  Stack,
} from '~/components/ui'
import {
  buildTabelogLink,
  type BusinessHours,
  getBusinessStatus,
  priceLevelLabel,
} from '../utils'
import { BusinessStatusBadge } from './business-status-badge'

export const LocalizedPlaceDetails = ({ place }: { place: LocalizedPlace }) => {
  const city = cities.find((c) => c.cityId === place.cityId)
  const language = languages.find((lang) => lang.id === place.language)
  const area = areas.find((area) => area.areaId === place.areaId)
  const date = new UTCDate()
  const businessStatusResult = getBusinessStatus(
    place.regularOpeningHours as BusinessHours | null,
    date,
    city?.timezone ?? 'Asia/Tokyo',
  )

  return (
    <Card>
      <CardHeader className="p-2 md:p-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle
              style={{ viewTransitionName: `displayName-${place.placeId}` }}
            >
              {place.displayName}
            </CardTitle>
            <CardDescription>{place.originalDisplayName}</CardDescription>
          </div>
          {area && language && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-600" />
              <span>{area.i18n[language.id]}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-2 md:p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Carousel>
              <CarouselContent>
                {place.photos.map((photoUrl, index) => (
                  <CarouselItem key={photoUrl}>
                    <img
                      src={photoUrl}
                      width={400}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      alt={`${place.displayName} - ${index + 1}`}
                      className="aspect-square w-full rounded-lg object-cover"
                      style={{
                        viewTransitionName:
                          index === 0 ? `hero-${place.placeId}` : '',
                      }}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          <Stack className="gap-2">
            <div className="flex flex-wrap gap-2">
              {place.genres.map((genre) => (
                <Badge
                  key={genre}
                  variant="secondary"
                  className="text-base capitalize"
                >
                  {genre}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Star className="h-6 w-6 fill-current text-yellow-400" />
                <span className="ml-2 text-2xl font-bold">
                  {place.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-600">
                ({place.userRatingCount} reviews)
              </span>

              <div className="flex-1" />

              {place.priceLevel && (
                <div className="flex-shrink-0 text-muted-foreground">
                  {priceLevelLabel(place.priceLevel)}
                </div>
              )}
            </div>

            <ClientOnly
              fallback={<div className="text-transparent">Status</div>}
            >
              {() => (
                <BusinessStatusBadge statusResult={businessStatusResult} />
              )}
            </ClientOnly>

            <HStack>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                asChild
              >
                <a
                  href={place.googleMapsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapIcon className="mr-2 h-4 w-4" />
                  Google Maps
                </a>
              </Button>
              {place.sourceUri && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <a
                    href={buildTabelogLink(place.sourceUri, place.language)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Tabelog
                  </a>
                </Button>
              )}
            </HStack>
          </Stack>
        </div>

        <h3 className="mt-4 text-2xl font-semibold" id="reviews">
          Recent Reviews
        </h3>
        {place.reviews.map((review, index) => (
          <Stack key={review.text} className="rounded-lg bg-gray-50 p-2 md:p-4">
            <div className="flex items-center">
              <Star className="h-5 w-5 fill-current text-yellow-400" />
              <span className="ml-2 font-bold">{review.rating.toFixed(1)}</span>
            </div>
            <p className="whitespace-pre-wrap break-words text-gray-700">
              {review.text}
            </p>
          </Stack>
        ))}
      </CardContent>
    </Card>
  )
}
