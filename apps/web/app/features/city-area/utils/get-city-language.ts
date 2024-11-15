import { cities, languages } from '@hyperlocal/consts'
import type { Params } from 'react-router';

export const getCity = (request: Request, params: Params) => {
  const { lang: langId } = params
  // リクエストURLのドメイン名から、都市を判定する
  // 例: https://tokyo.example.com -> cityId = 'tokyo'
  // 例: https://seoul.example.com -> cityId = 'seoul'
  const url = new URL(request.url)
  const host = url.host.split('.')[0]
  const city = cities.find((city) => city.cityId === host) ?? cities[0]
  const lang = languages.find((lang) => lang.id === langId) ?? languages[0]

  return { city, lang }
}
