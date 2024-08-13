import { textSearch } from '~/routes/_index/functions/places'

export const loader = async () => {
  const json = await textSearch({
    textQuery: 'restaurant',
    latitude: 35.6694464,
    longitude: 139.7670348,
    radius: 1000,
  })
  return json
}
