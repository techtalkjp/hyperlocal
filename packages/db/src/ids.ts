import { createHash } from 'node:crypto'

// 自社IDのプレフィックス (Google Place IDの "ChIJ" と衝突しない)
export const PLACE_ID_PREFIX = 'pl_'

// 正規化したソースURL (tabelog等) から決定的な自社IDを作る。
// 同じURLからは常に同じIDになるため、パイプラインは冪等。
export const selfIdFromSourceUri = (sourceUri: string): string => {
  const normalized = sourceUri
    .trim()
    .toLowerCase()
    .split(/[?#]/)[0]
    .replace(/\/+$/, '')
  return (
    PLACE_ID_PREFIX +
    createHash('sha256').update(`tabelog:${normalized}`).digest('hex').slice(0, 12)
  )
}

// ソースURLがない行のフォールバック (旧Google IDから生成)
export const selfIdFromGoogleId = (googlePlaceId: string): string =>
  PLACE_ID_PREFIX +
  createHash('sha256').update(`google:${googlePlaceId}`).digest('hex').slice(0, 12)
