import { describe, expect, it } from 'vitest'
import { buildTabelogLink } from './build-tabelog-link'

describe('buildTabelogLink', () => {
  const baseUrl = 'https://tabelog.com/tokyo/A1312/A131201/13280056/'

  it('should return the original URL for Japanese', () => {
    expect(buildTabelogLink(baseUrl, 'ja')).toBe(baseUrl)
  })

  it('should add correct language prefix for supported languages', () => {
    const testCases: [string, string][] = [
      ['en', 'https://tabelog.com/en/tokyo/A1312/A131201/13280056/'],
      ['zh-CN', 'https://tabelog.com/cn/tokyo/A1312/A131201/13280056/'],
      ['zh-TW', 'https://tabelog.com/tw/tokyo/A1312/A131201/13280056/'],
      ['ko', 'https://tabelog.com/kr/tokyo/A1312/A131201/13280056/'],
    ]

    for (const [language, expectedUrl] of testCases) {
      expect(buildTabelogLink(baseUrl, language)).toBe(expectedUrl)
    }
  })

  it('should default to English for unsupported languages', () => {
    const unsupportedLanguage = 'fr'
    expect(buildTabelogLink(baseUrl, unsupportedLanguage)).toBe(
      'https://tabelog.com/en/tokyo/A1312/A131201/13280056/',
    )
  })

  it('should handle URLs with different paths', () => {
    const differentUrl = 'https://tabelog.com/osaka/A2701/A270101/27053354/'
    expect(buildTabelogLink(differentUrl, 'en')).toBe(
      'https://tabelog.com/en/osaka/A2701/A270101/27053354/',
    )
  })
})
