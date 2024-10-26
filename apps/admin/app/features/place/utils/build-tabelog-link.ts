import { match } from 'ts-pattern'

export const buildTabelogLink = (url: string, language: string) => {
  // url: https://tabelog.com/tokyo/A1312/A131201/13280056/
  // ja: https://tabelog.com/tokyo/A1312/A131201/13280056/
  // en: https://tabelog.com/en/tokyo/A1312/A131201/13280056/
  // zh-CN: https://tabelog.com/cn/tokyo/A1312/A131201/13280056/
  // zh-TW: https://tabelog.com/tw/tokyo/A1312/A131201/13280056/
  // ko: https://tabelog.com/kr/tokyo/A1312/A131201/13280056/
  const languagePrefix = match(language)
    .with('ja', () => '')
    .with('en', () => 'en/')
    .with('zh-CN', () => 'cn/')
    .with('zh-TW', () => 'tw/')
    .with('ko', () => 'kr/')
    .otherwise(() => 'en/')
  return url.replace(
    'https://tabelog.com/',
    `https://tabelog.com/${languagePrefix}`,
  )
}
