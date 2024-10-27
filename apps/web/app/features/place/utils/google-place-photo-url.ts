/**
 * 指定したサイズの正方形画像URLを生成します
 * @param imageUrl 元のGoogle Places画像URL
 * @param size 正方形の一辺の長さ（ピクセル）
 * @returns 新しい画像URL
 */
export const getSquareImageUrl = (imageUrl: string, size: number): string => {
  // URLが正しいフォーマットかチェック
  if (!imageUrl.includes('googleusercontent.com/places/')) {
    throw new Error('Invalid Google Places image URL')
  }

  // 画像の基本部分とパラメータ部分を分離
  const [baseUrl] = imageUrl.split('=')
  if (!baseUrl) {
    throw new Error('Invalid URL format')
  }

  const maxSize = 1920
  const finalSize = Math.min(maxSize, size)

  // 正方形の画像URLを生成
  return `${baseUrl}=s${finalSize * 2}-w${finalSize}-h${finalSize}`
}

/**
 * 様々なプリセットサイズの正方形画像URLを生成します
 * @param imageUrl 元のGoogle Places画像URL
 * @returns 異なるサイズの画像URLオブジェクト
 */
export const getMultipleSizeUrls = (imageUrl: string) => {
  return {
    thumbnail: getSquareImageUrl(imageUrl, 100), // 100x100
    small: getSquareImageUrl(imageUrl, 200), // 200x200
    medium: getSquareImageUrl(imageUrl, 300), // 300x300
    large: getSquareImageUrl(imageUrl, 400), // 400x400
  } as const
}
