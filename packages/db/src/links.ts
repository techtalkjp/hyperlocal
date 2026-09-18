// Google依存なしのMapsリンク生成 (Universal URL scheme。APIキー不要)。
// 既存の ?cid= リンク (完全一致) があればそちらを優先し、
// 新規行のみこの生成リンクを使う。
export const googleMapsSearchUrl = (name: string, station?: string): string => {
  const query = [name.trim(), station?.trim()].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

// 交通手段テキストから最初の「○○駅」を抜く (エリア名フォールバック用の引数つき)
export const extractStation = (transport: string | null | undefined): string | undefined => {
  if (!transport) return undefined;
  const m = transport.replace(/\s+/g, "").match(/([\u4e00-\u9fa5ぁ-んァ-ンー・\-A-Za-z0-9]+駅)/);
  return m?.[1];
};
