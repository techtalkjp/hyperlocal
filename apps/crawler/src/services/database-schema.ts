export interface Database {
  restaurants: {
    area: string
    categories: string
    genres: string
    name: string
    rating: number
    reviewCount: number
    budgetDinner: string
    budgetLunch: string
    closedDay: string
    address: string
    url: string
    placeId: string | null
  }
  ranked_restaurants: {
    area: string
    category: string
    ranking_type: string
    rank: number
    genres: string
    name: string
    rating: number
    reviewCount: number
    budgetDinner: string
    budgetLunch: string
    closedDay: string
    address: string
    url: string
    placeId: string | null
  }
  crawled_restaurants: {
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
  tabelog_genres: {
    id: string
    category: string
    genre: string
  }
  genres: {
    id: string
    category: string
    genre: string
  }

  // Intermediate tables
  tr_tabelog_restaurants_genres: {
    area: string
    name: string
    rating: number
    reviewCount: number
    budgetLunch: string
    budgetDinner: string
    closedDay: string
    address: string
    url: string
    genre: string
  }
  tr_restaurants_with_genre_categories: {
    area: string
    genre: string
    name: string
    rating: number
    reviewCount: number
    budgetLunch: string
    budgetDinner: string
    closedDay: string
    address: string
    url: string
    categories: string[]
  }
  tr_expanded_restaurants: {
    area: string
    genre: string
    name: string
    rating: number
    reviewCount: number
    budgetLunch: string
    budgetDinner: string
    closedDay: string
    address: string
    url: string
    category: string
  }
  tr_restaurants_by_category: {
    area: string
    category: string
    genres: string
    name: string
    rating: number
    reviewCount: number
    budgetLunch: string
    budgetDinner: string
    closedDay: string
    address: string
    url: string
    placeId: string | null
  }
  tr_rating_rank: {
    area: string
    category: string
    genres: string
    name: string
    rating: number
    reviewCount: number
    budgetLunch: string
    budgetDinner: string
    closedDay: string
    address: string
    url: string
    ranking_type: string
    rank: number
    placeId: string | null
  }
  tr_review_rank: {
    area: string
    category: string
    genres: string
    name: string
    rating: number
    reviewCount: number
    budgetLunch: string
    budgetDinner: string
    closedDay: string
    address: string
    url: string
    ranking_type: string
    rank: number
    placeId: string | null
  }
}

export const tableMappings = {
  crawled_restaurants: `
    read_json('./storage/datasets/restaurant/*.json',
      columns={
        "url": "STRING",
        "area": "STRING",
        "name": "STRING",
        "rating": "DOUBLE",
        "reviewCount": "DOUBLE",
        "budgetDinner": "STRING",
        "budgetLunch": "STRING",
        "closedDay": "STRING",
        "address": "STRING",
        "categories": "JSON",
        "genres": "JSON",
        "features": "JSON"
      })`,
  tabelog_genres: `
    read_json('./tabelog-genres.json',
      columns={
        "id": "STRING",
        "category": "STRING",
        "genre": "STRING"
      })`,
}
