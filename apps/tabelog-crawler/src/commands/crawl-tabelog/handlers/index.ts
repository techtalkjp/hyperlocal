import { createCheerioRouter } from 'crawlee'
import { restaurantDetailHandler } from './restaurant-detail.js'
import { restaurantListHandler } from './restaurant-list.js'
import { reviewDtailHandler } from './review-detail.js'
import { reviewListHandler } from './review-list.js'
import { HandlerLabel } from './types.js'

export { HandlerLabel }

export const router = createCheerioRouter()
router.addHandler(HandlerLabel.RESTAURANT_LIST, restaurantListHandler)
router.addHandler(HandlerLabel.RESTAURANT_DETAIL, restaurantDetailHandler)
router.addHandler(HandlerLabel.REVIEW_LIST, reviewListHandler)
router.addHandler(HandlerLabel.REVIEW_DETAIL, reviewDtailHandler)
