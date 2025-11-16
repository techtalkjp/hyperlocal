import type { City } from '@hyperlocal/consts'

const PRODUCTION_BASE_DOMAIN = 'hyper-local.app'

export const getCityDomain = (url: string, cityId?: City['cityId']): URL => {
  const newUrl = new URL(url)

  // In production or when dealing with hyper-local.app domains,
  // always use the production domain structure
  if (
    newUrl.hostname.includes('hyper-local.app') ||
    newUrl.hostname === 'localhost'
  ) {
    newUrl.hostname = cityId
      ? `${cityId}.${PRODUCTION_BASE_DOMAIN}`
      : PRODUCTION_BASE_DOMAIN
    newUrl.protocol = 'https:'
  } else {
    // For other domains, maintain the existing behavior
    const parts = newUrl.hostname.split('.')

    if (!cityId) {
      newUrl.hostname = parts.length > 2 ? parts.slice(1).join('.') : newUrl.hostname
    } else if (parts.length > 2) {
      parts[0] = cityId
      newUrl.hostname = parts.join('.')
    } else {
      newUrl.hostname = `${cityId}.${newUrl.hostname}`
    }
  }

  return newUrl
}
