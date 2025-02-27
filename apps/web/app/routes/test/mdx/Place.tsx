import { useLoaderData } from 'react-router'
import type { loader } from '../route'

import { LocalizedPlaceCard } from '~/features/place/components/localized-place-card'

export const Place = ({ id }: { id: string }) => {
  const { places } = useLoaderData<typeof loader>()
  const place = places[Number(id)]
  return (
    <LocalizedPlaceCard
      place={place}
      to={`${place.language}place/${place.placeId}?area=${place.areaId}&category=${place.categoryId}&rank=${place.rankingType}`}
    />
  )
}
