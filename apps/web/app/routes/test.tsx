import { db, type LocalizedPlace } from '@hyper-local/db'
import { useLoaderData } from '@remix-run/react'
import { LocalizedPlaceCard } from '~/features/place/components/localized-place-card'

export const loader = async () => {
  const place = (await db
    .selectFrom('localizedPlaces')
    .where('cityId', '==', 'seoul')
    .where('areaId', '==', 'apgujeongrodeo')
    .where('categoryId', '==', 'nightlife')
    .where('placeId', '==', 'ChIJDW_5Ko2lfDURDQ_PKEQOcz8')
    .selectAll()
    .executeTakeFirstOrThrow()) as unknown as LocalizedPlace

  return { place }
}

export default function Test() {
  const { place } = useLoaderData<typeof loader>()
  return <LocalizedPlaceCard place={place} />
}
