export interface CrawledRestaurants {
  url: string
  area: string
  name: string
  rating: number
  reviewCount: number
  budgetDinner: string
  budgetLunch: string
  closedDay: string
  address: string
  features: Record<string, string>
}

export interface Review {
  restaurantUrl: string
  area: string
  url: string
  title: string
  content: string
  rating: number
}
