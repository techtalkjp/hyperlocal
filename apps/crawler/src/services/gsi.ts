// 国土地理院住所検索で緯度経度を取る (無料・キー不要)。
// 番地まで切り詰めるのがコツ (ビル名以下は落とす)。
export const geocodeBlock = async (
  address: string,
): Promise<{ lat: number; lng: number } | null> => {
  const m = address
    .replace(/\s+/g, '')
    .match(/^(.+?[0-9]+-[0-9]+(?:-[0-9]+)?)/)
  const q = m?.[1] ?? address.slice(0, 60)
  const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(q)}`
  const res = await fetch(url, { headers: { 'User-Agent': 'hyperlocal-ingest/0.1' } })
  if (!res.ok) return null
  const hits = (await res.json()) as Array<{
    geometry: { coordinates: [number, number] }
  }>
  if (hits.length === 0) return null
  const [lng, lat] = hits[0].geometry.coordinates
  return { lat, lng }
}
