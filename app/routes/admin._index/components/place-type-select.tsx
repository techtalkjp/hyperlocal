import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui'

const placeTypes = {
  art_gallery: 'Art Gallery',
  museum: 'Museum',
  aqualium: 'Aqualium',
  event_venue: 'Event Venue',
  historical_landmark: 'Historical Landmark',
  night_club: 'Night Club',
  park: 'Park',
  tourist_attraction: 'Tourist Attraction',
  visitor_center: 'Visitor Center',
  bar: 'Bar',
  cafe: 'Cafe',
  coffee_shop: 'Coffee Shop',
  ice_cream_shop: 'Ice Cream Shop',
  sandwich_shop: 'Sandwich Shop',
  sushi_restaurant: 'Sushi Restaurant',
  japanese_restaurant: 'Japanese Restaurant',
  american_restaurant: 'American Restaurant',
  chinese_restaurant: 'Chinese Restaurant',
  korean_restaurant: 'Korean Restaurant',
  thai_restaurant: 'Thai Restaurant',
  indonesian_restaurant: 'Indonesian Restaurant',
  vegan_restaurant: 'Vegan Restaurant',
  vegitarian_restaurant: 'Vegitarian Restaurant',
  drugstore: 'Drugstore',
  pharmacy: 'Pharmacy',
  spa: 'Spa',
  beauty_salon: 'Beauty Salon',
  book_store: 'Book Store',
  convenience_store: 'convenience_store',
  department_store: 'Department Store',
  discount_store: 'Discount Store',
  gift_shop: 'Gift Shop',
  grocery_store: 'Grocery Store',
  market: 'Market',
  shopping_mall: 'Shopping Mall',
  supermarket: 'Supermarket',
  airport: 'Airport',
  bus_station: 'Bus Station',
  bus_stop: 'Bus Stop',
  subway_station: 'Subway Station',
  train_station: 'Train Station',
}
export const PlaceTypeSelect = ({
  name,
  ...rest
}: React.ComponentProps<typeof Select>) => {
  return (
    <Select name={name} {...rest}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(placeTypes).map(([key, value]) => (
          <SelectItem key={key} value={key}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
