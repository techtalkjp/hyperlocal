import { areas, cities, languages } from '@hyperlocal/consts'
import type { LocalizedPlace } from '@hyperlocal/db'
import { ExternalLink, MapPin, Star } from 'lucide-react'
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
} from '~/components/ui'
import dayjs from '~/libs/dayjs'
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
  const date = dayjs().utc().toDate()
  const businessStatusResult = getBusinessStatus(
    place.regularOpeningHours as BusinessHours | null,
    date,
    city?.timezone ?? 'Asia/Tokyo',
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-3xl font-bold">
              {place.displayName}
            </CardTitle>
            <CardDescription className="mt-2 text-lg">
              {place.originalDisplayName}
            </CardDescription>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
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
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Carousel>
              <CarouselContent>
                {place.photos.map((photoUrl, index) => (
                  <CarouselItem key={photoUrl}>
                    <img
                      src={photoUrl}
                      alt={`${place.displayName} - ${index + 1}`}
                      width={400}
                      height={400}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      className="h-[400px] w-full rounded-lg object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            <div className="mt-4 flex items-center space-x-4">
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
          </div>

          <div>
            <div className="space-y-4">
              <ClientOnly
                fallback={<div className="text-transparent">Status</div>}
              >
                {() => (
                  <BusinessStatusBadge statusResult={businessStatusResult} />
                )}
              </ClientOnly>

              {area && language && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <span>{area.i18n[language.id]}</span>
                </div>
              )}

              <Button className="w-full" asChild>
                <a
                  href={place.googleMapsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Google Maps
                </a>
              </Button>
              {place.sourceUri && (
                <Button variant="outline" className="w-full" asChild>
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
            </div>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="mb-4 text-2xl font-semibold">All Reviews</h3>
          {place.reviews.map((review, index) => (
            <div key={review.text} className="mb-4 rounded-lg bg-gray-50 p-4">
              <div className="mb-2 flex items-center">
                <Star className="h-5 w-5 fill-current text-yellow-400" />
                <span className="ml-2 font-bold">
                  {review.rating.toFixed(1)}
                </span>
              </div>
              <p className="whitespace-pre-wrap break-words text-gray-700">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
