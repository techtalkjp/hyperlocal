import type { City } from '@hyper-local/consts'

const SPECIAL_DOMAINS = ['localhost', 'hyper-local.app'] as const
type SpecialDomain = (typeof SPECIAL_DOMAINS)[number]

const isSpecialDomain = (hostname: string): boolean =>
  SPECIAL_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  )

const getBaseDomain = (hostname: string): SpecialDomain | null =>
  SPECIAL_DOMAINS.find(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  ) || null

const handleSpecialDomain = (hostname: string, cityId?: string): string => {
  const baseDomain = getBaseDomain(hostname)
  if (!baseDomain) return hostname

  const parts = hostname.split('.')

  if (cityId) {
    return `${cityId}.${baseDomain}`
  }
  // If no cityId is provided, always return the base domain
  return baseDomain
}

const handleRegularDomain = (hostname: string, cityId?: string): string => {
  const parts = hostname.split('.')

  if (!cityId) {
    return parts.length > 2 ? parts.slice(1).join('.') : hostname
  }

  if (parts.length > 2) {
    parts[0] = cityId
  } else {
    parts.unshift(cityId)
  }
  return parts.join('.')
}

export const getCityDomain = (url: URL, cityId?: City['cityId']): URL => {
  const newUrl = new URL(url.href)

  newUrl.hostname = isSpecialDomain(newUrl.hostname)
    ? handleSpecialDomain(newUrl.hostname, cityId)
    : handleRegularDomain(newUrl.hostname, cityId)

  return newUrl
}
