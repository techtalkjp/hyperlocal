export interface CrawledRestaurants {
  url: string;
  area: string;
  name: string;
  rating: number;
  reviewCount: number;
  budgetDinner: string;
  budgetLunch: string;
  closedDay: string;
  address: string;
  // 代表写真 (og:image, 640x640)。旧クロール分は無い
  imageUrl?: string;
  features: Record<string, string>;
}

export interface Review {
  restaurantUrl: string;
  area: string;
  url: string;
  title: string;
  content: string;
  rating: number;
}
