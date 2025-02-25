import { describe, expect, it } from 'vitest'
import { getPathParams } from './get-path-params'

describe('getPathParams', () => {
  const createRequest = (path: string) =>
    new Request(`http://tokyo.example.com${path}`)

  describe('language parameter tests', () => {
    it('should return English (default) when no language specified', () => {
      const result = getPathParams(createRequest('/'), {})
      expect(result.lang.id).toBe('en')
    })

    it('should return specified language when valid', () => {
      const result = getPathParams(createRequest('/ja'), { lang: 'ja' })
      expect(result.lang.id).toBe('ja')
    })

    it('should throw 404 when invalid language specified', () => {
      expect(() =>
        getPathParams(createRequest('/invalid-lang'), { lang: 'invalid-lang' }),
      ).toThrow()
    })
  })

  describe('area parameter tests', () => {
    it('should return area when valid', () => {
      const result = getPathParams(createRequest('/area/shibuya'), {
        area: 'shibuya',
      })
      expect(result.area?.areaId).toBe('shibuya')
    })

    it('should throw 404 when invalid area specified and required', () => {
      expect(() =>
        getPathParams(
          createRequest('/area/invalid-area'),
          { area: 'invalid-area' },
          { require: { area: true } },
        ),
      ).toThrow()
    })

    it('should return undefined when invalid area specified and not required', () => {
      const result = getPathParams(createRequest('/area/invalid-area'), {
        area: 'invalid-area',
      })
      expect(result.area).toBeUndefined()
    })
  })

  describe('category parameter tests', () => {
    it('should return category when valid', () => {
      const result = getPathParams(createRequest('/area/shibuya/lunch'), {
        area: 'shibuya',
        category: 'lunch',
      })
      expect(result.category?.id).toBe('lunch')
    })

    it('should throw 404 when invalid category specified and required', () => {
      expect(() =>
        getPathParams(
          createRequest('/area/shibuya/invalid-category'),
          { area: 'shibuya', category: 'invalid-category' },
          { require: { category: true } },
        ),
      ).toThrow()
    })

    it('should return undefined when invalid category specified and not required', () => {
      const result = getPathParams(
        createRequest('/area/shibuya/invalid-category'),
        { area: 'shibuya', category: 'invalid-category' },
      )
      expect(result.category).toBeUndefined()
    })
  })

  describe('rank parameter tests', () => {
    it('should return ranking type when valid', () => {
      const result = getPathParams(
        createRequest('/area/shibuya/lunch/review'),
        { area: 'shibuya', category: 'lunch', rank: 'review' },
      )
      expect(result.rankingType).toBe('review')
    })

    it('should throw 404 when invalid ranking type specified and required', () => {
      expect(() =>
        getPathParams(
          createRequest('/area/shibuya/lunch/invalid-rank'),
          { area: 'shibuya', category: 'lunch', rank: 'invalid-rank' },
          { require: { rank: true } },
        ),
      ).toThrow()
    })

    it('should return undefined when invalid ranking type specified and not required', () => {
      const result = getPathParams(
        createRequest('/area/shibuya/lunch/invalid-rank'),
        { area: 'shibuya', category: 'lunch', rank: 'invalid-rank' },
      )
      expect(result.rankingType).toBeUndefined()
    })
  })

  describe('combination parameter tests', () => {
    it('should handle all valid parameters', () => {
      const result = getPathParams(
        createRequest('/ja/area/shibuya/lunch/review'),
        { lang: 'ja', area: 'shibuya', category: 'lunch', rank: 'review' },
        { require: { lang: true, area: true, category: true, rank: true } },
      )
      expect(result.lang?.id).toBe('ja')
      expect(result.area?.areaId).toBe('shibuya')
      expect(result.category?.id).toBe('lunch')
      expect(result.rankingType).toBe('review')
    })

    it('should throw 404 when any required parameter is invalid', () => {
      expect(() =>
        getPathParams(
          createRequest('/ja/area/invalid-area/lunch/review'),
          {
            lang: 'ja',
            area: 'invalid-area',
            category: 'lunch',
            rank: 'review',
          },
          { require: { area: true, category: true, rank: true } },
        ),
      ).toThrow()
    })
  })
})
