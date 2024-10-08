import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'
import { zx } from 'zodix'

export const headers: HeadersFunction = () => {
  return {
    'cache-control': 'public, max-age=31536000, s-maxage=31536000',
  }
}
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { maxWidthPx, maxHeightPx } = zx.parseQuery(request, {
    maxWidthPx: zx.NumAsString.optional().default('400'),
    maxHeightPx: zx.NumAsString.optional().default('400'),
  })
  const name = params['*']?.replace(/.jpg$/, '') // jpg をつけて vercel cache を効かせる
  if (!name) {
    return new Response(null, { status: 404, statusText: 'Not Found' })
  }
  const ret = await fetch(
    `https://places.googleapis.com/v1/${name}/media?key=${process.env.GOOGLE_MAPS_API_KEY}&maxWidthPx=${maxWidthPx}&maxHeightPx=${maxHeightPx}`,
  )
  return ret
}
