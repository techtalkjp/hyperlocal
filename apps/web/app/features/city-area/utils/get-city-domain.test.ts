import type { City } from '@hyperlocal/consts' // Adjust the import path as needed
import { describe, expect, it } from 'vitest'
import { getCityDomain } from './get-city-domain' // Adjust the import path as needed

describe('getCityDomain', () => {
  const testCases: Array<{
    description: string
    input: { url: string; cityId?: City['cityId'] }
    expected: string
  }> = [
    {
      description: 'should add city to localhost',
      input: { url: 'https://localhost:5173/', cityId: 'tokyo' },
      expected: 'https://tokyo.localhost:5173/',
    },
    {
      description: 'should not change localhost without cityId',
      input: { url: 'https://localhost:5173/' },
      expected: 'https://localhost:5173/',
    },
    {
      description: 'should remove city from localhost when cityId is undefined',
      input: { url: 'https://tokyo.localhost:5173/' },
      expected: 'https://localhost:5173/',
    },
    {
      description: 'should add city to hyper-local.app',
      input: { url: 'https://hyper-local.app/', cityId: 'tokyo' },
      expected: 'https://tokyo.hyper-local.app/',
    },
    {
      description: 'should not change hyper-local.app without cityId',
      input: { url: 'https://hyper-local.app/' },
      expected: 'https://hyper-local.app/',
    },
    {
      description: 'should change city for hyper-local.app',
      input: { url: 'https://tokyo.hyper-local.app/', cityId: 'osaka' },
      expected: 'https://osaka.hyper-local.app/',
    },
    {
      description:
        'should remove city from hyper-local.app when cityId is undefined',
      input: { url: 'https://tokyo.hyper-local.app/' },
      expected: 'https://hyper-local.app/',
    },
    {
      description: 'should add city to regular domain',
      input: { url: 'https://hostname.com/', cityId: 'tokyo' },
      expected: 'https://tokyo.hostname.com/',
    },
    {
      description: 'should change city for regular domain',
      input: { url: 'https://tokyo.hostname.com/', cityId: 'osaka' },
      expected: 'https://osaka.hostname.com/',
    },
    {
      description:
        'should remove city from regular domain when cityId is undefined',
      input: { url: 'https://tokyo.hostname.com/' },
      expected: 'https://hostname.com/',
    },
    {
      description:
        'should preserve path and query parameters for special domain',
      input: {
        url: 'https://tokyo.hyper-local.app/path?param1=value1&param2=value2',
        cityId: 'osaka',
      },
      expected:
        'https://osaka.hyper-local.app/path?param1=value1&param2=value2',
    },
    {
      description:
        'should preserve path, query parameters, and fragment for regular domain',
      input: {
        url: 'https://hostname.com/page?query=test#section1',
        cityId: 'tokyo',
      },
      expected: 'https://tokyo.hostname.com/page?query=test#section1',
    },
    {
      description:
        'should preserve path, query parameters, and fragment when changing city for regular domain',
      input: {
        url: 'https://osaka.hostname.com/page?query=test#section1',
        cityId: 'tokyo',
      },
      expected: 'https://tokyo.hostname.com/page?query=test#section1',
    },
  ]

  for (const { description, input, expected } of testCases) {
    it(description, () => {
      const result = getCityDomain(new URL(input.url), input.cityId)
      expect(result.href).toBe(expected)
    })
  }

  it('should not modify the original URL object', () => {
    const originalUrl = new URL('https://tokyo.hostname.com/path?query=test')
    const originalHref = originalUrl.href
    getCityDomain(originalUrl, 'osaka')
    expect(originalUrl.href).toBe(originalHref)
  })
})
