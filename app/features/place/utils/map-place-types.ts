import type { Place } from '~/services/google-places'

const placeTypeLabelMap: Record<string, string> = {
  american_restaurant: 'american',
  bakery: 'bakery',
  bar: 'bar',
  barbecue_restaurant: 'barbecue',
  brazilian_restaurant: 'brazilian',
  breakfast_restaurant: 'breakfast',
  brunch_restaurant: 'brunch',
  cafe: 'cafe',
  chinese_restaurant: 'chinese',
  coffee_shop: 'coffee',
  fast_food_restaurant: 'fast food',
  french_restaurant: 'french',
  greek_restaurant: 'greek',
  hamburger_restaurant: 'hamburger',
  ice_cream_shop: 'ice cream',
  indian_restaurant: 'indian',
  indonesian_restaurant: 'indonesian',
  italian_restaurant: 'italian',
  japanese_restaurant: 'japanese',
  korean_restaurant: 'korean',
  lebanese_restaurant: 'lebanese',
  mediterranean_restaurant: 'mediterranean',
  mexican_restaurant: 'mexican',
  middle_eastern_restaurant: 'middle eastern',
  pizza_restaurant: 'pizza',
  ramen_restaurant: 'ramen',
  sandwich_shop: 'sandwich',
  seafood_restaurant: 'seafood',
  spanish_restaurant: 'spanish',
  steak_house: 'steak',
  sushi_restaurant: 'sushi',
  thai_restaurant: 'thai',
  turkish_restaurant: 'turkish',
  vegan_restaurant: 'vegan',
  vegetarian_restaurant: 'vegetarian',
  vietnamese_restaurant: 'vietnamese',
}

// 表示する Badge をフィルタ
export const mapPlaceTypes = (types: Place['types']) => {
  return types
    .filter((type) => Object.keys(placeTypeLabelMap).includes(type))
    .map((type: string) => placeTypeLabelMap[type] ?? '')
}
