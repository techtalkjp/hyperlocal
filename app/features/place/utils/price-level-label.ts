import { match } from 'ts-pattern'
import type { Place } from '~/services/google-places'
// 円マークを追加

export const priceLevelLabel = (priceLevel?: Place['priceLevel']) => {
  return match(priceLevel)
    .with('PRICE_LEVEL_EXPENSIVE', () => '¥¥¥')
    .with('PRICE_LEVEL_MODERATE', () => '¥¥')
    .with('PRICE_LEVEL_INEXPENSIVE', () => '¥')
    .otherwise(() => '')
}
