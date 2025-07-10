import { languages } from '@hyperlocal/consts'

interface AlternateLinkData {
  url: string
  areaId?: string
  categoryId?: string
  rankingType?: string
}

const CANONICAL_BASE_URL = 'https://tokyo.hyper-local.app'

export const generateAlternateLinks = (data: AlternateLinkData) => {
  const pathSegments: string[] = []

  if (data.areaId) pathSegments.push(`area/${data.areaId}`)
  if (data.categoryId) pathSegments.push(`${data.categoryId}`)
  if (data.rankingType) pathSegments.push(`${data.rankingType}`)

  const path = pathSegments.join('/')

  return [
    ...languages.map((lang) => ({
      rel: 'alternate',
      hrefLang: lang.hreflang,
      href: `${CANONICAL_BASE_URL}${lang.path}${path}`,
      tagName: 'link',
    })),
    {
      rel: 'alternate',
      hrefLang: 'x-default',
      href: `${CANONICAL_BASE_URL}/${path}`,
      tagName: 'link',
    },
  ]
}
