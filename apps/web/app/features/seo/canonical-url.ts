const CANONICAL_BASE_URL = 'https://tokyo.hyper-local.app'

export const generateCanonicalUrl = (pathname: string): string => {
  // Remove trailing slash if present (except for root path)
  const cleanPath = pathname === '/' ? pathname : pathname.replace(/\/$/, '')
  return `${CANONICAL_BASE_URL}${cleanPath}`
}

export const generateCanonicalLink = (pathname: string) => {
  return {
    tagName: 'link' as const,
    rel: 'canonical',
    href: generateCanonicalUrl(pathname),
  }
}