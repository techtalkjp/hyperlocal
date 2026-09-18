import { db } from '@hyperlocal/db'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { listLocalizedPlaces } from '../app/routes/_public.($lang)/area/$area/$category/$rank/+queries.server'

// R2読み取りshardのexporter (v0: ローカル出力のみ、R2 PUTはpublish-shards.ts)
// 使い方: pnpm tsx scripts/export-shards.ts --out /tmp/shards --version 20260915
//         pnpm tsx scripts/export-shards.ts --out /tmp/surgical --version <現行版> --only guide-index
// DBは DATABASE_URL 環境変数 (.env) を見る。SELECTのみで無害。
//
// 出力:
//   manifest.json                                  (既存あればfiles/countsをマージ)
//   listing/{lang}/{area}/{category}/{rank}.json  (listLocalizedPlacesと同形)
//   place/{lang}/{placeId}.json                   (localized行全体)
//   geo/{area}.json                               (nearme/絞り込み用薄索引)
//   guide/{lang}/{area}/{scene}.json              (記事＋参照placeIds)
//   guide-index/{lang}/{area}.json                (他記事一覧 [{sceneId,title}])

const args = process.argv.slice(2)
const flag = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const outDir = flag('--out')
const versionArg = flag('--version')
// --only listing,place : 部分出力 (surgical追加用。manifestは既存とマージ)
const onlyArg = flag('--only')
const only = new Set(
  onlyArg
    ? onlyArg.split(',')
    : ['listing', 'place', 'geo', 'guide', 'guide-index'],
)
if (!outDir) {
  throw new Error('--out <dir> is required')
}
const version =
  versionArg ?? new Date().toISOString().slice(0, 13).replace(/[-T:]/g, '')

const files: Record<string, string> = {}
const write = (logicalPath: string, data: unknown) => {
  const body = JSON.stringify(data)
  const hash = createHash('sha256').update(body).digest('hex').slice(0, 16)
  const full = path.join(outDir, version, logicalPath)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, body)
  files[logicalPath] = hash
  return body.length
}

let bytes = 0
const counts: Record<string, number> = {}

// DBに存在する組合せのみ列挙 (直積で作らない)
const combos = await db
  .selectFrom('localizedPlaces')
  .select(['cityId', 'areaId', 'categoryId', 'rankingType', 'language'])
  .distinct()
  .execute()

// 1. listing（DB負荷を抑えるため8件ずつ並列）
counts.listing = 0
if (only.has('listing')) {
  const targets = combos.filter(
    (c): c is typeof c & { rankingType: 'rating' | 'review' } =>
      c.rankingType === 'rating' || c.rankingType === 'review',
  )
  for (let i = 0; i < targets.length; i += 8) {
    const chunk = await Promise.all(
      targets.slice(i, i + 8).map(async (c) => {
        const places = await listLocalizedPlaces({
          cityId: c.cityId,
          areaId: c.areaId,
          categoryId: c.categoryId,
          language: c.language,
          rankingType: c.rankingType,
        })
        return { c, places }
      }),
    )
    for (const { c, places } of chunk) {
      bytes += write(
        `listing/${c.language}/${c.areaId}/${c.categoryId}/${c.rankingType}.json`,
        places,
      )
      counts.listing++
    }
  }
}

// 2. place: 言語ごとに一括取得し (placeId,lang) で1行に確定
counts.place = 0
if (only.has('place')) {
  const languages = [...new Set(combos.map((c) => c.language))]
  for (const lang of languages) {
    const rows = await db
      .selectFrom('localizedPlaces')
      .selectAll()
      .where('language', '==', lang)
      .orderBy('placeId')
      .orderBy('areaId')
      .orderBy('categoryId')
      .orderBy('rankingType')
      .execute()
    const seen = new Set<string>()
    for (const row of rows) {
      const pid = row.placeId as string
      if (seen.has(pid)) continue
      seen.add(pid)
      bytes += write(`place/${lang}/${pid}.json`, row)
      counts.place++
    }
  }
}

// 3. geo: places正準から薄索引 (言語非依存)
counts.geo = 0
if (only.has('geo')) {
  const areaIds = [
    ...new Set(
      (
        await db
          .selectFrom('placeListings')
          .select('areaId')
          .distinct()
          .execute()
      ).map((r) => r.areaId),
    ),
  ]
  for (const areaId of areaIds) {
    const ids = new Set(
      (
        await db
          .selectFrom('placeListings')
          .select('placeId')
          .where('areaId', '==', areaId)
          .execute()
      ).map((r) => r.placeId as string),
    )
    const geo = (
      await db
        .selectFrom('places')
        .selectAll()
        .where('id', 'in', [...ids])
        .execute()
    ).map((p) => ({
      id: p.id,
      lat: (p as Record<string, unknown>).latitude,
      lng: (p as Record<string, unknown>).longitude,
      rating: (p as Record<string, unknown>).rating,
      userRatingCount: (p as Record<string, unknown>).userRatingCount,
      priceLevel: (p as Record<string, unknown>).priceLevel,
      categories: (p as Record<string, unknown>).categories,
      genres: (p as Record<string, unknown>).genres,
      hours: (p as Record<string, unknown>).regularOpeningHours,
    }))
    bytes += write(`geo/${areaId}.json`, geo)
    counts.geo++
  }
}

// 4. guide: 記事＋参照placeIds (カード結合はWorker側でplace shardを引く)
const articles = await db.selectFrom('areaArticles').selectAll().execute()
counts.guide = 0
if (only.has('guide')) {
  for (const a of articles) {
    const row = a as unknown as Record<string, unknown>
    const content = String(row.content ?? '')
    const placeIds = [
      ...new Set(
        [...content.matchAll(/<Place id="([^"]+)"/g)].map((m) => m[1]),
      ),
    ]
    bytes += write(`guide/${row.language}/${row.areaId}/${row.sceneId}.json`, {
      ...row,
      placeIds,
    })
    counts.guide++
  }
}

// 5. guide-index: 他記事一覧 (言語×エリア)
counts['guide-index'] = 0
if (only.has('guide-index')) {
  const keys = [...new Set(articles.map((a) => `${a.language}/${a.areaId}`))]
  for (const key of keys) {
    const [language, areaId] = key.split('/')
    const list = articles
      .filter((a) => a.language === language && a.areaId === areaId)
      .map((a) => ({ sceneId: a.sceneId, title: a.title }))
    bytes += write(`guide-index/${language}/${areaId}.json`, list)
    counts['guide-index']++
  }
}

// manifestは既存とマージ (surgical追加時は版・他countsを維持)
const manifestPath = path.join(outDir, 'manifest.json')
let prev: {
  version?: string
  counts?: Record<string, number>
  bytes?: number
  files?: Record<string, string>
} = {}
try {
  prev = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
} catch {
  // 新規
}
const exportedCounts: Record<string, number> = {}
for (const [kind, count] of Object.entries(counts)) {
  if (only.has(kind)) exportedCounts[kind] = count
}
const manifest = {
  version,
  publishedAt: new Date().toISOString(),
  counts: { ...(prev.counts ?? {}), ...exportedCounts },
  bytes: (prev.bytes ?? 0) + bytes,
  files: { ...(prev.files ?? {}), ...files },
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
console.log(
  JSON.stringify(
    { version, counts, bytes, files: Object.keys(files).length },
    null,
    2,
  ),
)
process.exit(0)
