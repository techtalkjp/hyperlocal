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
