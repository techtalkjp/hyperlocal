import type React from 'react'

/**
 * デバイスごとの画像サイズ設定
 */
export const IMAGE_SIZES = {
  MOBILE: 400, // モバイル基本サイズ
  TABLET: 640, // タブレット基本サイズ
  DESKTOP: 1200, // デスクトップ基本サイズ
} as const

/**
 * 異なるデバイス向けの画像URLを生成します
 * @param imageUrl 元のGoogle Places画像URL
 * @returns デバイスごとの最適化された画像URL
 */
export const getResponsiveImageUrls = (imageUrl: string) => {
  // URLが正しいフォーマットかチェック
  if (!imageUrl.includes('googleusercontent.com/places/')) {
    throw new Error('Invalid Google Places image URL')
  }

  const [baseUrl] = imageUrl.split('=')
  if (!baseUrl) {
    throw new Error('Invalid URL format')
  }

  return {
    mobile: `${baseUrl}=s4800-w${IMAGE_SIZES.MOBILE}-h${IMAGE_SIZES.MOBILE}`,
    tablet: `${baseUrl}=s${IMAGE_SIZES.TABLET * 2}-w${IMAGE_SIZES.TABLET}-h${IMAGE_SIZES.TABLET}`,
    desktop: `${baseUrl}=s${IMAGE_SIZES.DESKTOP * 2}-w${IMAGE_SIZES.DESKTOP}-h${IMAGE_SIZES.DESKTOP}`,
  } as const
}

interface ResponsivePlacesImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  imageUrl: string
  alt: string
}

/**
 * レスポンシブな Google Places 画像コンポーネント
 */
export const ResponsivePlacesImage: React.FC<ResponsivePlacesImageProps> = ({
  imageUrl,
  alt,
  className = '',
  style,
}) => {
  const urls = getResponsiveImageUrls(imageUrl)

  return (
    <picture>
      {/* モバイルファースト: デフォルトで小さい画像を使用 */}
      <source
        media="(min-width: 1024px)"
        srcSet={urls.desktop}
        width={IMAGE_SIZES.DESKTOP}
        height={IMAGE_SIZES.DESKTOP}
      />
      <source
        media="(min-width: 768px)"
        srcSet={urls.tablet}
        width={IMAGE_SIZES.TABLET}
        height={IMAGE_SIZES.TABLET}
      />
      <img
        src={urls.mobile}
        alt={alt}
        width={IMAGE_SIZES.MOBILE}
        height={IMAGE_SIZES.MOBILE}
        className={`h-full w-full object-cover ${className}`}
        style={style}
        loading="lazy"
        decoding="async"
      />
    </picture>
  )
}
