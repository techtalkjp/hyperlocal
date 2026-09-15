import { db } from '@hyperlocal/db'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { listLocalizedPlaces } from '../app/routes/_public.($lang)/area/$area/$category/$rank/+queries.server'

// R2読み取りshardのexporter (v0: ローカル出力のみ、R2 PUTは次段)
// 使い方: pnpm tsx scripts/export-shards.ts --out /tmp/shards --version dev
// DBは DATABASE_URL 環境変数 (.env) を見る。SELECTのみで無害。
//
// 出力:
//   manifest.json
//   listing/{lang}/{area}/{category}/{rank}.json  (listLocalizedPlacesと同形)
//   place/{lang}/{placeId}.json                   (localized行全体)
//   geo/{area}.json                               (nearme/絞り込み用薄索引)
//   guide/{lang}/{area}/{scene}.json              (記事＋参照placeIds)

const args = process.argv.slice(2)
const outDir = args[args.indexOf('--out') + 1]
const versionArg = args[args.indexOf('--version') + 1]
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

// 1. listing: DBに存在する組合せのみ列挙 (直積で作らない)
const combos = await db
  .selectFrom('localizedPlaces')
  .select(['cityId', 'areaId', 'categoryId', 'rankingType', 'language'])
  .distinct()
  .execute()
counts.listing = 0
for (const c of combos) {
  if (c.rankingType !== 'rating' && c.rankingType !== 'review') continue
  const places = await listLocalizedPlaces({
    cityId: c.cityId,
    areaId: c.areaId,
    categoryId: c.categoryId,
    language: c.language,
    rankingType: c.rankingType,
  })
  bytes += write(
    `listing/${c.language}/${c.areaId}/${c.categoryId}/${c.rankingType}.json`,
    places,
  )
  counts.listing++
}

// 2. place: 言語ごとに一括取得し (placeId,lang) で1行に確定
counts.place = 0
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

// 3. geo: places正準から薄索引 (言語非依存)
counts.geo = 0
const areaIds = [
  ...new Set(
    (
      await db.selectFrom('placeListings').select('areaId').distinct().execute()
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

// 4. guide: 記事＋参照placeIds (カード結合はWorker側でplace shardを引く)
const articles = await db.selectFrom('areaArticles').selectAll().execute()
counts.guide = 0
for (const a of articles) {
  const row = a as unknown as Record<string, unknown>
  const content = String(row.content ?? '')
  const placeIds = [
    ...new Set([...content.matchAll(/<Place id="([^"]+)"/g)].map((m) => m[1])),
  ]
  bytes += write(
    `guide/${row.language}/${row.area_id ?? row.areaId}/${row.scene_id ?? row.sceneId}.json`,
    { ...row, placeIds },
  )
  counts.guide++
}

const manifest = {
  version,
  publishedAt: new Date().toISOString(),
  counts,
  bytes,
  files,
}
fs.writeFileSync(
  path.join(outDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
)
console.log(
  JSON.stringify(
    { version, counts, bytes, files: Object.keys(files).length },
    null,
    2,
  ),
)
process.exit(0)
