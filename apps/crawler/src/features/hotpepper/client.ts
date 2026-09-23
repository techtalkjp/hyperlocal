// ホットペッパーグルメ Webサービス (無料・要クレジット表記)
// https://webservice.recruit.co.jp/doc/hotpepper/reference.html
export interface HotpepperShop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  photo: { pc: { l: string; m: string; s: string }; mobile: { l: string; s: string } };
  open?: string;
  close?: string;
  capacity?: number | string;
  budget?: { name?: string; average?: string };
  urls?: { pc?: string };
}

const ENDPOINT = "https://webservice.recruit.co.jp/hotpepper/gourmet/v1/";

// range: 1=300m 2=500m 3=1000m 4=2000m 5=3000m
export const searchShopsAround = async (
  key: string,
  lat: number,
  lng: number,
  range: 1 | 2 | 3 | 4 | 5,
): Promise<HotpepperShop[]> => {
  const shops: HotpepperShop[] = [];
  for (let start = 1; ; start += 100) {
    const url = new URL(ENDPOINT);
    url.searchParams.set("key", key);
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lng", String(lng));
    url.searchParams.set("range", String(range));
    url.searchParams.set("count", "100");
    url.searchParams.set("start", String(start));
    url.searchParams.set("format", "json");
    const res = await fetch(url);
    if (!res.ok) throw new Error(`hotpepper HTTP ${res.status}`);
    const json = (await res.json()) as {
      results: { results_available?: number; shop?: HotpepperShop[]; error?: unknown };
    };
    if (json.results.error)
      throw new Error(`hotpepper error: ${JSON.stringify(json.results.error)}`);
    const page = json.results.shop ?? [];
    shops.push(...page);
    const available = json.results.results_available ?? 0;
    if (page.length === 0 || start + 100 > available || start >= 1000) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  return shops;
};

// 店名の正規化: NFKC, 小文字, 空白・記号除去, 括弧内 (読み仮名など) 除去
export const normalizeName = (name: string): string =>
  name
    .normalize("NFKC")
    .toLowerCase()
    .replaceAll(/[（(][^）)]*[）)]/g, "")
    .replaceAll(/[\s・･·\-‐–—―/／&＆'’"”~〜～!！?？.。、,，:：;；「」『』【】\[\]]+/g, "");

const bigrams = (s: string) => {
  const set = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
  return set;
};
// Dice係数 (文字バイグラム)
export const nameSimilarity = (a: string, b: string): number => {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.length >= 3 && nb.length >= 3 && (na.includes(nb) || nb.includes(na))) return 0.9;
  const ba = bigrams(na);
  const bb = bigrams(nb);
  if (ba.size === 0 || bb.size === 0) return 0;
  let hit = 0;
  for (const g of ba) if (bb.has(g)) hit++;
  return (2 * hit) / (ba.size + bb.size);
};

export const distanceMeters = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};
