// 食べログ「交通手段」欄の末尾に付く定型「◯◯駅から123m」から最寄駅と距離を取る。
// 例: "地下鉄 半蔵門線 半蔵門駅 １番出口より徒歩２分 ... 半蔵門駅から252m"
//     "浅草駅（東武・都営・メトロ）から227m"  → 浅草駅
export interface NearestStation {
  station: string;
  meters: number;
}

const TAIL = /([^\s、。「」()（）]+?駅)(?:[（(][^）)]*[）)])?から(\d+)m\s*$/;

export const parseNearestStation = (
  transport: string | null | undefined,
): NearestStation | null => {
  if (!transport) return null;
  const m = TAIL.exec(transport.replaceAll(/[\u3000\t\r\n]+/g, " ").trim());
  if (!m) return null;
  return { station: m[1] as string, meters: Number(m[2]) };
};
