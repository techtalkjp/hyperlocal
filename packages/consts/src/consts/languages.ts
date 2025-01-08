import { z } from 'zod'

export const LanguageIdSchema = z.union([
  z.literal('en'),
  z.literal('zh-cn'),
  z.literal('zh-tw'),
  z.literal('ko'),
  z.literal('ja'),
])
export type LanguageId = z.infer<typeof LanguageIdSchema>

export type i18nRecord = Record<LanguageId, string>

export interface Language {
  id: LanguageId
  path: string // root path for the language
  displayName: string
  name: string
}

export const languages = [
  { id: 'en', path: '/', displayName: 'English', name: 'English' },
  {
    id: 'zh-cn',
    path: '/zh-cn/',
    displayName: '中文簡体',
    name: 'Simplified Chinese',
  },
  {
    id: 'zh-tw',
    path: '/zh-tw/',
    displayName: '中文繁体',
    name: 'Traditional Chinese',
  },
  { id: 'ko', path: '/ko/', displayName: '한국어', name: 'Korean' },
  { id: 'ja', path: '/ja/', displayName: '日本語', name: 'Japanese' },
] as const satisfies Language[]
