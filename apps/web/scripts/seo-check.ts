/**
 * SEO現状把握スクリプト
 *
 * 本番URLにHTTPリクエストして robots.txt / sitemap / 代表ページの
 * ステータス・正規URL・hreflang・title/description・キャッシュヘッダを
 * AIに貼れるMarkdownレポートとして出力する。
 *
 * 使い方:
 *   pnpm --filter @hyperlocal/web seo:check
 *   pnpm --filter @hyperlocal/web seo:check -- --origin https://tokyo.hyper-local.app --samples 3
 */
import { languages } from '@hyperlocal/consts'

const args = process.argv.slice(2)
const getArg = (name: string, fallback: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}

const ORIGIN = getArg('origin', 'https://tokyo.hyper-local.app').replace(
  /\/$/,
  '',
)
const SAMPLES_PER_SITEMAP = Number(getArg('samples', '3'))
const FETCH_TIMEOUT_MS = Number(getArg('timeout', '20000'))

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) hyperlocal-seo-check/1.0'
const GOOGLEBOT_UA =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html) hyperlocal-seo-check/1.0'

interface UrlCheck {
  url: string
  status: number | string
  ms: number | string
  title: string
  description: string
  canonical: string
  hreflangs: string
  robotsMeta: string
  cacheControl: string
  cdnCacheControl: string
  note: string
}

async function fetchText(url: string, ua: string) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)
  const started = Date.now()
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': ua },
      redirect: 'manual',
      signal: ctrl.signal,
    })
    const ms = Date.now() - started
    const body = await res.text().catch(() => '')
    return { res, body, ms }
  } finally {
    clearTimeout(t)
  }
}

function extractTag(
  html: string,
  re: RegExp,
  group = 1,
  fallback = '(なし)',
): string {
  const m = html.match(re)
  const v = m?.[group]?.trim()
  return v ? v.slice(0, 200) : fallback
}

function checkHtml(
  _url: string,
  _status: number,
  html: string,
): Omit<
  UrlCheck,
  'url' | 'status' | 'ms' | 'cacheControl' | 'cdnCacheControl' | 'note'
> {
  const title = extractTag(html, /<title[^>]*>([^<]*)<\/title>/i)
  const description = extractTag(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
  )
  const canonical = extractTag(
    html,
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
  )
  const robotsMeta = extractTag(
    html,
    /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i,
    1,
    '(指定なし)',
  )
  const hreflangMatches = [
    ...html.matchAll(/<link[^>]+hreflang=["']([^"']+)["'][^>]*>/gi),
  ].map((m) => m[1])
  return {
    title,
    description,
    canonical,
    hreflangs:
      hreflangMatches.length > 0 ? hreflangMatches.join(',') : '(なし)',
    robotsMeta,
  }
}

function locsFromXml(xml: string, tag: 'loc'): string[] {
  // sitemap index の <loc> と、通常HTML内の<link>を混同しないよう
  // XML専用の単純抽出にとどめる
  if (tag === 'loc') {
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
  }
  return []
}

async function checkUrl(url: string): Promise<UrlCheck> {
  try {
    const { res, body, ms } = await fetchText(url, BROWSER_UA)
    const cacheControl = res.headers.get('cache-control') ?? '(なし)'
    const cdnCacheControl =
      res.headers.get('cloudflare-cdn-cache-control') ?? '(なし)'
    if (res.status >= 300 && res.status < 400) {
      return {
        url,
        status: res.status,
        ms,
        title: '(リダイレクト)',
        description: `→ ${res.headers.get('location') ?? '(不明)'}`,
        canonical: '(リダイレクト)',
        hreflangs: '(リダイレクト)',
        robotsMeta: '(リダイレクト)',
        cacheControl,
        cdnCacheControl,
        note: '',
      }
    }
    if (!res.ok) {
      return {
        url,
        status: res.status,
        ms,
        title: '(取得失敗)',
        description: body.slice(0, 120),
        canonical: '-',
        hreflangs: '-',
        robotsMeta: '-',
        cacheControl,
        cdnCacheControl,
        note: `HTTP ${res.status}`,
      }
    }
    const parsed = checkHtml(url, res.status, body)
    return {
      url,
      status: res.status,
      ms,
      ...parsed,
      cacheControl,
      cdnCacheControl,
      note: '',
    }
  } catch (e) {
    return {
      url,
      status: 'ERR',
      ms: '-',
      title: '(取得失敗)',
      description: e instanceof Error ? e.message : String(e),
      canonical: '-',
      hreflangs: '-',
      robotsMeta: '-',
      cacheControl: '-',
      cdnCacheControl: '-',
      note: 'fetch失敗(タイムアウト等)',
    }
  }
}

const main = async () => {
  const lines: string[] = []
  const warn: string[] = []
  lines.push(`# SEOチェック ${ORIGIN}`)
  lines.push(`実行: ${new Date().toISOString()}`)
  lines.push('')

  // 1. robots.txt
  lines.push('## 1. robots.txt')
  try {
    const { res, body } = await fetchText(`${ORIGIN}/robots.txt`, BROWSER_UA)
    lines.push(`- status: ${res.status}`)
    lines.push('```')
    lines.push(body.slice(0, 2000))
    lines.push('```')
    const sitemapUrl = body.match(/Sitemap:\s*(\S+)/)?.[1]
    if (!sitemapUrl) warn.push('robots.txtにSitemap行がない')
    else {
      const { res: sres } = await fetchText(sitemapUrl, BROWSER_UA)
      lines.push(`- Sitemap行: ${sitemapUrl} (status ${sres.status})`)
      if (!sres.ok) warn.push(`robots.txtのSitemapが${sres.status}`)
    }
    if (/GPTBot|SemrushBot/.test(body)) {
      lines.push('- 注: GPTBot/SemrushBotのDisallowあり(Googlebotには影響なし)')
    }
  } catch (e) {
    warn.push(`robots.txt取得失敗: ${e instanceof Error ? e.message : e}`)
    lines.push(`- 取得失敗: ${e instanceof Error ? e.message : e}`)
  }
  lines.push('')

  // 2. sitemap index
  lines.push('## 2. sitemap.xml')
  let childSitemaps: string[] = []
  try {
    const { res, body } = await fetchText(`${ORIGIN}/sitemap.xml`, BROWSER_UA)
    lines.push(`- status: ${res.status}`)
    if (!res.ok) {
      warn.push(`sitemap.xmlがHTTP ${res.status}`)
    } else {
      childSitemaps = locsFromXml(body, 'loc')
      lines.push(`- 子sitemap数: ${childSitemaps.length}`)
      for (const loc of childSitemaps) lines.push(`  - ${loc}`)
    }
  } catch (e) {
    warn.push(`sitemap.xml取得失敗: ${e instanceof Error ? e.message : e}`)
  }
  lines.push('')

  // 3. 子sitemapの中身
  lines.push('## 3. 子sitemap詳細')
  const sampledUrls: string[] = []
  // トップページ(全言語)はsitemap外の可能性もあるため固定で追加
  for (const lang of languages) {
    sampledUrls.push(`${ORIGIN}${lang.path}`)
  }
  for (const child of childSitemaps) {
    try {
      const { res, body } = await fetchText(child, BROWSER_UA)
      if (!res.ok) {
        lines.push(`- ${child}: HTTP ${res.status} ←要修正`)
        warn.push(`子sitemapがHTTP ${res.status}: ${child}`)
        continue
      }
      const urls = locsFromXml(body, 'loc')
      lines.push(`- ${child}: ${urls.length}件`)
      if (urls.length === 0) warn.push(`空の子sitemap: ${child}`)
      if (urls.length > 50000)
        warn.push(`50,000件超の子sitemap: ${child}(${urls.length}件)`)
      // 先頭だけでなく中盤・末尾からも均等サンプル(カテゴリ/下層の偏り防止)
      const picks: string[] = []
      const n = Math.min(SAMPLES_PER_SITEMAP, urls.length)
      for (let i = 0; i < n; i++) {
        const idx = Math.floor((i * urls.length) / n)
        picks.push(urls[idx])
      }
      sampledUrls.push(...picks)
    } catch (e) {
      lines.push(
        `- ${child}: 取得失敗(${e instanceof Error ? e.message : e}) ←要修正`,
      )
      warn.push(`子sitemap取得失敗: ${child}`)
    }
  }
  lines.push('')

  // 4. 代表URLの実取得
  const uniq = [...new Set(sampledUrls)].slice(
    0,
    languages.length + childSitemaps.length * SAMPLES_PER_SITEMAP,
  )
  lines.push(`## 4. 代表URLチェック(${uniq.length}件)`)
  const results: UrlCheck[] = []
  for (const url of uniq) {
    results.push(await checkUrl(url))
  }
  lines.push(
    '| URL | 状態 | 応答 | canonical | hreflang | title | description | robots | cache |',
  )
  lines.push('|---|---|---|---|---|---|---|---|---|')
  for (const r of results) {
    const short = (s: string | number) =>
      String(s).replace(/\|/g, '/').slice(0, 60)
    lines.push(
      `| ${r.url.replace(ORIGIN, '') || '/'} | ${r.status} | ${r.ms}ms | ${short(r.canonical)} | ${short(r.hreflangs)} | ${short(r.title)} | ${short(r.description)} | ${short(r.robotsMeta)} | ${short(r.cacheControl)} |`,
    )
    if (r.canonical !== '(なし)' && !String(r.canonical).startsWith(ORIGIN)) {
      warn.push(`正規URLが自ドメイン外の可能性: ${r.url} → ${r.canonical}`)
    }
    if (r.canonical === '(なし)') warn.push(`canonicalなし: ${r.url}`)
    if (r.hreflangs === '(なし)') warn.push(`hreflangなし: ${r.url}`)
    if (r.title === '(なし)') warn.push(`titleなし(空headの可能性): ${r.url}`)
    if (Number(r.ms) > 3000) warn.push(`応答が遅い(>3s): ${r.url}`)
    if (r.status !== 200) warn.push(`非200: ${r.url} (${r.status})`)
  }
  lines.push('')

  // 5. Googlebot UAとの差分(先頭1件のみ)
  lines.push('## 5. Googlebot UA差分(先頭URLのみ)')
  if (uniq[0]) {
    try {
      const browser = await fetchText(uniq[0], BROWSER_UA)
      const bot = await fetchText(uniq[0], GOOGLEBOT_UA)
      lines.push(`- ブラウザUA: ${browser.res.status}, ${browser.ms}ms`)
      lines.push(`- GooglebotUA: ${bot.res.status}, ${bot.ms}ms`)
      if (browser.res.status !== bot.res.status) {
        warn.push(
          `UAでステータスが変わる: ${browser.res.status} vs ${bot.res.status}`,
        )
      }
    } catch (e) {
      lines.push(`- 差分取得失敗: ${e instanceof Error ? e.message : e}`)
    }
  }
  lines.push('')

  lines.push('## 6. 要対応サマリ')
  if (warn.length === 0) lines.push('- 自動検出の問題なし')
  else for (const w of [...new Set(warn)]) lines.push(`- [要確認] ${w}`)
  lines.push('')
  lines.push(
    'このレポート全文をAIチャットに貼ると、次の診断(正規化/hreflang/速度/動的SSR起因の推定)ができます。',
  )

  console.log(lines.join('\n'))
}

await main()
