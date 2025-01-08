import { describe, expect, it } from 'vitest'
import { generateAreaCategoryMetaDescription } from './meta-area-category'

describe('generateMetaDescription', () => {
  const testCases = [
    {
      cityId: 'tokyo',
      areaId: 'ningyocho',
      categoryId: 'cafe' as const,
      languageId: 'en' as const,
    },
    {
      cityId: 'tokyo',
      areaId: 'ningyocho',
      categoryId: 'sweet' as const,
      languageId: 'ja' as const,
    },
    {
      cityId: 'tokyo',
      areaId: 'ningyocho',
      categoryId: 'breakfast' as const,
      languageId: 'zh-cn' as const,
    },
    {
      cityId: 'tokyo',
      areaId: 'ningyocho',
      categoryId: 'nightlife' as const,
      languageId: 'zh-tw' as const,
    },
    {
      cityId: 'tokyo',
      areaId: 'ningyocho',
      categoryId: 'tourist_attractions' as const,
      languageId: 'ko' as const,
    },
    {
      cityId: 'tokyo',
      areaId: 'ningyocho',
      categoryId: 'transit' as const,
      languageId: 'en' as const,
    },
    {
      cityId: 'tokyo',
      areaId: 'ningyocho',
      categoryId: 'convenience_store' as const,
      languageId: 'ja' as const,
    },
    {
      cityId: 'tokyo',
      areaId: 'ningyocho',
      categoryId: 'drugstore' as const,
      languageId: 'zh-cn' as const,
    },
  ]

  for (const { cityId, areaId, categoryId, languageId } of testCases) {
    it(`generates correct description for ${cityId}, ${areaId}, ${categoryId} in ${languageId}`, () => {
      const result = generateAreaCategoryMetaDescription(
        cityId,
        areaId,
        categoryId,
        languageId,
      )
      expect(result).toBeTypeOf('string')
      expect(result.length).toBeGreaterThan(0)
      // expect(result).toContain(cityId)
      // expect(result).toContain(areaId)
      // カテゴリと言語に特化したチェック
      switch (languageId) {
        case 'en':
          expect(result).toContain('Hyperlocal')
          expect(result).toContain('Instant guide')
          break
        case 'ja':
          expect(result).toContain('ガイド')
          expect(result).toContain('サクッと見つけよう')
          break
        case 'ko':
          expect(result).toContain('즉석 가이드')

          break
      }
    })
  }

  it.skip('handles edge cases with empty strings', () => {
    expect(
      generateAreaCategoryMetaDescription('', '', 'cafe', 'en'),
    ).toThrowError()
  })

  it('generates unique descriptions for different categories in the same area', () => {
    const cafe = generateAreaCategoryMetaDescription(
      'tokyo',
      'ningyocho',
      'cafe',
      'en',
    )
    const restaurant = generateAreaCategoryMetaDescription(
      'tokyo',
      'ningyocho',
      'sweet',
      'en',
    )
    expect(cafe).not.toEqual(restaurant)
    expect(cafe).toContain('best cafes')
    expect(restaurant).toContain('top sweet spots')
  })

  it('generates descriptions with correct length', () => {
    const description = generateAreaCategoryMetaDescription(
      'tokyo',
      'ningyocho',
      'shopping',
      'en',
    )
    expect(description.length).toBeLessThanOrEqual(200) // Adjust this value based on your SEO requirements
  })
})
