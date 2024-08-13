import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui'

const placeTypes = {
  entertainment_and_recreation: {
    label: 'Entertainment and Recreation',
    types: {
      park: 'Park',
      tourist_attraction: 'Tourist Attraction',
    },
  },
  food_and_drink: {
    label: 'Food and Drink',
    types: {
      bar: 'Bar',
      cafe: 'Cafe',
      ice_cream_shop: 'Ice Cream Shop',
      restaurant: 'Restaurant',
      sushi_restaurant: 'Sushi Restaurant',
      japanese_restaurant: 'Japanese Restaurant',
      american_restaurant: 'American Restaurant',
      chinese_restaurant: 'Chinese Restaurant',
      korean_restaurant: 'Korean Restaurant',
      thai_restaurant: 'Thai Restaurant',
      indonesian_restaurant: 'Indonesian Restaurant',
      vegan_restaurant: 'Vegan Restaurant',
      vegitarian_restaurant: 'Vegitarian Restaurant',
    },
  },
  health_and_wellness: {
    label: 'Health and Wellness',
    types: {
      drugstore: 'Drugstore',
      pharmacy: 'Pharmacy',
    },
  },

  shopping: {
    label: 'Shopping',
    types: {
      book_store: 'Book Store',
      convenience_store: 'Convenience Store',
      department_store: 'Department Store',
      gift_shop: 'Gift Shop',
      grocery_store: 'Grocery Store',
      market: 'Market',
      shopping_mall: 'Shopping Mall',
      supermarket: 'Supermarket',
    },
  },
  transportation: {
    label: 'Transportation',
    types: {
      bus_stop: 'Bus Stop',
      subway_station: 'Subway Station',
      train_station: 'Train Station',
    },
  },
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
        {Object.entries(placeTypes).map(([key, value]) => {
          return (
            <SelectGroup key={key}>
              <SelectLabel>{value.label}</SelectLabel>
              {Object.entries(value.types).map(([key, value]) => {
                return (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                )
              })}
            </SelectGroup>
          )
        })}
      </SelectContent>
    </Select>
  )
}
