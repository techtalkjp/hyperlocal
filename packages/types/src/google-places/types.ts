export type GooglePlaceType =
  | PlaceType_Automotive
  | PlaceType_Business
  | PlaceType_Culture
  | PlaceType_Education
  | PlaceType_EntertainmentAndRecreation
  | PlaceType_Finance
  | PlaceType_FoodAndDrink
  | PlaceType_GeographicalAreas
  | PlaceType_Government
  | PlaceType_HealthAndWellness
  | PlaceType_Lodging
  | PlaceType_PlacesOfWorship
  | PlaceType_Services
  | PlaceType_Shopping
  | PlaceType_Sports
  | PlaceType_Transportation

type PlaceType_Automotive =
  | 'car_dealer'
  | 'car_rental'
  | 'car_repair'
  | 'car_wash'
  | 'electric_vehicle_charging_station'
  | 'gas_station'
  | 'parking'
  | 'rest_stop'
type PlaceType_Business = 'farm'
type PlaceType_Culture = 'art_gallery' | 'library' | 'museum'
type PlaceType_Education =
  | 'library'
  | 'preschool'
  | 'primary_school'
  | 'school'
  | 'secondary_school'
  | 'university'
type PlaceType_EntertainmentAndRecreation =
  | 'amusement_center'
  | 'amusement_park'
  | 'aquarium'
  | 'banquet_hall'
  | 'bowling_alley'
  | 'casino'
  | 'community_center'
  | 'convention_center'
  | 'cultural_center'
  | 'dog_park'
  | 'event_venue'
  | 'hiking_area'
  | 'historical_landmark'
  | 'marina'
  | 'movie_rental'
  | 'movie_theater'
  | 'national_park'
  | 'night_club'
  | 'park'
  | 'tourist_attraction'
  | 'visitor_center'
  | 'wedding_venue'
  | 'zoo'
type PlaceType_Finance = 'accounting' | 'atm' | 'bank'
type PlaceType_FoodAndDrink =
  | 'american_restaurant'
  | 'bakery'
  | 'bar'
  | 'barbecue_restaurant'
  | 'brazilian_restaurant'
  | 'breakfast_restaurant'
  | 'brunch_restaurant'
  | 'cafe'
  | 'chinese_restaurant'
  | 'coffee_shop'
  | 'fast_food_restaurant'
  | 'french_restaurant'
  | 'greek_restaurant'
  | 'hamburger_restaurant'
  | 'ice_cream_shop'
  | 'indian_restaurant'
  | 'indonesian_restaurant'
  | 'italian_restaurant'
  | 'japanese_restaurant'
  | 'korean_restaurant'
  | 'lebanese_restaurant'
  | 'meal_delivery'
  | 'meal_takeaway'
  | 'mediterranean_restaurant'
  | 'mexican_restaurant'
  | 'middle_eastern_restaurant'
  | 'pizza_restaurant'
  | 'ramen_restaurant'
  | 'restaurant'
  | 'sandwich_shop'
  | 'seafood_restaurant'
  | 'spanish_restaurant'
  | 'steak_house'
  | 'sushi_restaurant'
  | 'thai_restaurant'
  | 'turkish_restaurant'
  | 'vegan_restaurant'
  | 'vegetarian_restaurant'
  | 'vietnamese_restaurant'
type PlaceType_GeographicalAreas =
  | 'administrative_area_level_1'
  | 'administrative_area_level_2'
  | 'country	locality'
  | 'postal_code'
  | 'school_district'
type PlaceType_Government =
  | 'city_hall'
  | 'courthouse'
  | 'embassy'
  | 'fire_station'
  | 'local_government_office'
  | 'police'
  | 'post_office'
type PlaceType_HealthAndWellness =
  | 'dental_clinic'
  | 'dentist'
  | 'doctor'
  | 'drugstore'
  | 'hospital'
  | 'medical_lab'
  | 'pharmacy'
  | 'physiotherapist'
  | 'spa'
type PlaceType_Lodging =
  | 'bed_and_breakfast'
  | 'campground'
  | 'camping_cabin'
  | 'cottage'
  | 'extended_stay_hotel'
  | 'farmstay'
  | 'guest_house	hostel'
  | 'hotel'
  | 'lodging'
  | 'motel'
  | 'private_guest_room'
  | 'resort_hotel'
  | 'rv_park'
type PlaceType_PlacesOfWorship =
  | 'church'
  | 'hindu_temple'
  | 'mosque'
  | 'synagogue'
type PlaceType_Services =
  | 'barber_shop'
  | 'beauty_salon'
  | 'cemetery'
  | 'child_care_agency'
  | 'consultant'
  | 'courier_service'
  | 'electrician'
  | 'florist'
  | 'funeral_home'
  | 'hair_care'
  | 'hair_salon'
  | 'insurance_agency'
  | 'laundry'
  | 'lawyer'
  | 'locksmith'
  | 'moving_company'
  | 'painter'
  | 'plumber'
  | 'real_estate_agency'
  | 'roofing_contractor'
  | 'storage'
  | 'tailor'
  | 'telecommunications_service_provider'
  | 'travel_agency'
  | 'veterinary_care'
type PlaceType_Shopping =
  | 'auto_parts_store'
  | 'bicycle_store'
  | 'book_store'
  | 'cell_phone_store'
  | 'clothing_store'
  | 'convenience_store'
  | 'department_store'
  | 'discount_store'
  | 'electronics_store'
  | 'furniture_store'
  | 'gift_shop'
  | 'grocery_store'
  | 'hardware_store'
  | 'home_goods_store'
  | 'home_improvement_store'
  | 'jewelry_store'
  | 'liquor_store'
  | 'market'
  | 'pet_store'
  | 'shoe_store'
  | 'shopping_mall'
  | 'sporting_goods_store'
  | 'store'
  | 'supermarket'
  | 'wholesaler'
type PlaceType_Sports =
  | 'athletic_field'
  | 'fitness_center'
  | 'golf_course'
  | 'gym'
  | 'playground'
  | 'ski_resort'
  | 'sports_club'
  | 'sports_complex'
  | 'stadium'
  | 'swimming_pool'
type PlaceType_Transportation =
  | 'airport'
  | 'bus_station'
  | 'bus_stop'
  | 'ferry_terminal'
  | 'heliport'
  | 'light_rail_station'
  | 'park_and_ride'
  | 'subway_station'
  | 'taxi_stand'
  | 'train_station'
  | 'transit_depot'
  | 'transit_station'
  | 'truck_stop'

export interface GooglePlace {
  name: string
  id: string
  types: GooglePlaceType[]
  displayName: {
    text: string
  }
  rating?: number
  userRatingCount: number
  location: {
    latitude: number
    longitude: number
  }
  googleMapsUri: string
  regularOpeningHours: GooglePlaceOpeningHours | undefined
  businessStatus: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY'
  priceLevel: GooglePlacePriceLevel | undefined
  reviews?: GooglePlaceReview[]
  photos?: GooglePlacePhoto[]
}

export interface GooglePlaceOpeningHours {
  openNow: boolean
  periods: {
    open: { day: number; hour: number; minute: number }
    close: { day: number; hour: number; minute: number }
  }[]
  weekdayDescriptions: string[]
}

export type GooglePlaceBusinessStatus =
  | 'OPERATIONAL'
  | 'CLOSED_TEMPORARILY'
  | 'CLOSED_PERMANENTLY'
export type GooglePlacePriceLevel =
  | 'PRICE_LEVEL_UNSPECIFIED'
  | 'PRICE_LEVEL_FREE'
  | 'PRICE_LEVEL_INEXPENSIVE'
  | 'PRICE_LEVEL_MODERATE'
  | 'PRICE_LEVEL_EXPENSIVE'

export interface GooglePlaceReview {
  rating: number
  originalText?: {
    text: string
  }
}

export interface GooglePlacePhoto {
  name: string
}
