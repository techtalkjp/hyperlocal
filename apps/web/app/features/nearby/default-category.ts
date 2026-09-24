import { TZDate } from "@date-fns/tz";

// 時間帯から「いま探しそうなカテゴリ」を決める (現在地セクションの初期タブ)
export const defaultCategoryForNow = (date: Date, timeZone: string): string => {
  const hour = new TZDate(date, timeZone).getHours();
  if (hour < 10) return "cafe";
  if (hour < 14) return "lunch";
  if (hour < 17) return "cafe";
  if (hour < 22) return "dinner";
  return "nightlife";
};
