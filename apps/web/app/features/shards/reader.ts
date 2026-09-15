// R2 shard読み (export-shards.ts の配布物)。読めなければnull→呼出側はTursoにfallback。
// - manifestは60秒edge cache＋worker内60秒保持
// - 版付きshardはimmutableとして1年edge cache
// - R2_PUBLIC_URL (公開R2) 経由でfetchするためbinding不要

interface ShardManifest {
  version: string
  publishedAt: string
  counts: Record<string, number>
  bytes: number
  files: Record<string, string>
}

const MANIFEST_TTL_MS = 60_000
let manifestCache: { at: number; data: ShardManifest } | undefined

type CfFetchInit = RequestInit & {
  cf?: { cacheEverything?: boolean; cacheTtl?: number }
}

const baseUrl = () => (process.env.R2_PUBLIC_URL ?? '').replace(/\/+$/, '')

const cachedFetch = async (
  url: string,
  ttl: number,
): Promise<unknown | null> => {
  if (!baseUrl()) return null
  try {
    const res = await fetch(url, {
      cf: { cacheEverything: true, cacheTtl: ttl },
    } as CfFetchInit)
    if (!res.ok) return null
    return (await res.json()) as unknown
  } catch {
    return null
  }
}

export const getShardManifest = async (): Promise<ShardManifest | null> => {
  if (manifestCache && Date.now() - manifestCache.at < MANIFEST_TTL_MS) {
    return manifestCache.data
  }
  const data = (await cachedFetch(
    `${baseUrl()}/shards/manifest.json`,
    60,
  )) as ShardManifest | null
  if (data?.version) {
    manifestCache = { at: Date.now(), data }
    return data
  }
  return null
}

export const readShard = async <T>(logicalPath: string): Promise<T | null> => {
  const manifest = await getShardManifest()
  if (!manifest) return null
  const data = await cachedFetch(
    `${baseUrl()}/shards/${manifest.version}/${logicalPath}`,
    31_536_000,
  )
  return (data ?? null) as T | null
}
