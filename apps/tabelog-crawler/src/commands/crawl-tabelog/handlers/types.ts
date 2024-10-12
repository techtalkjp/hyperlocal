import type { createCheerioRouter } from 'crawlee'

export type Handler = Parameters<
  ReturnType<typeof createCheerioRouter>['addHandler']
>['1']

export enum HandlerLabel {
  RESTAURANT_LIST = 'restaurant-list',
  RESTAURANT_DETAIL = 'restaurant-detail',
  REVIEW_LIST = 'review-list',
  REVIEW_DETAIL = 'review-detail',
}
