// 食べログ詳細ページの「営業時間」欄 (features["営業時間"]) を Google Places 互換の
// regularOpeningHours ({ periods, weekdayDescriptions }) に変換する。
//
// 入力例 (空白正規化後):
//   "月・火・水・木・金 11:30 - 15:00 L.O. 14:30 17:00 - 21:00 土・日・祝日 11:30 - 17:00 月 定休日 ■ 定休日..."
//   "09:00 - 22:30"                      (曜日なし = 毎日)
//   "24時間営業"
//
// 構造化されているのは先頭部分だけで、後半は自由記述なので、■ や ※ 以降は読まない。
// 祝日・祝前日・祝後日は曜日に固定できないため無視する。

export interface OpeningPeriod {
  open: { day: number; hour: number; minute: number };
  close?: { day: number; hour: number; minute: number };
}
export interface RegularOpeningHours {
  periods: OpeningPeriod[];
  weekdayDescriptions: string[];
}

// Google と同じ 0=日曜
const DAY_INDEX: Record<string, number> = { 日: 0, 月: 1, 火: 2, 水: 3, 木: 4, 金: 5, 土: 6 };
const DAY_TOKEN = /^(?:(?:月|火|水|木|金|土|日|祝日|祝前日|祝後日)(?:・|$))+$/;
const TIME_TOKEN = /^(翌)?(\d{1,2})[:：](\d{2})$/;
const STOP_TOKEN = /^[■※【]|営業時間・定休日は変更/;

const toMinutes = (t: string): number | null => {
  const m = TIME_TOKEN.exec(t);
  if (!m) return null;
  const hour = Number(m[2]) + (m[1] ? 24 : 0);
  const minute = Number(m[3]);
  if (minute > 59 || hour > 47) return null;
  return hour * 60 + minute;
};

export const parseTabelogOpeningHours = (raw: string | undefined): RegularOpeningHours | null => {
  if (!raw) return null;
  const tokens = raw
    .replaceAll(/[　\t\r\n]+/g, " ")
    .replaceAll(/\s*-\s*/g, " - ")
    .replaceAll(/\s*[～〜]\s*/g, " - ")
    .split(" ")
    .filter(Boolean);

  const byDay = new Map<number, Array<{ start: number; end: number }>>();
  const add = (days: number[], start: number, end: number) => {
    for (const d of days) {
      const list = byDay.get(d) ?? [];
      list.push({ start, end });
      byDay.set(d, list);
    }
  };

  const ALL = [0, 1, 2, 3, 4, 5, 6];
  let days: number[] | null = null; // null = 曜日未指定 (毎日)
  let sawStructure = false;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i] as string;
    if (STOP_TOKEN.test(t)) break;

    if (t === "24時間営業") {
      return {
        periods: [{ open: { day: 0, hour: 0, minute: 0 } }],
        weekdayDescriptions: ALL.map((d) => `${dayLabel(d)}: 24時間営業`),
      };
    }
    if (DAY_TOKEN.test(t)) {
      days = t
        .split("・")
        .map((d) => DAY_INDEX[d])
        .filter((d): d is number => d !== undefined);
      sawStructure = true;
      continue;
    }
    if (t === "定休日") {
      // days が閉店。既に登録済みがあれば残す (「月 定休日」は月曜のレコード無し)
      continue;
    }
    const start = toMinutes(t);
    if (start !== null && tokens[i + 1] === "-") {
      const end = toMinutes(tokens[i + 2] ?? "");
      if (end !== null) {
        add(days ?? ALL, start, end);
        sawStructure = true;
        i += 2;
      }
    }
    // 単独の時刻 (L.O. 14:30 など) は無視
  }

  if (!sawStructure || byDay.size === 0) return null;

  const periods: OpeningPeriod[] = [];
  for (const [day, ranges] of [...byDay.entries()].sort((a, b) => a[0] - b[0])) {
    for (const r of ranges) {
      const open = { day, hour: Math.floor(r.start / 60), minute: r.start % 60 };
      // 閉店が開店以前 (深夜営業) または 24 時以上なら翌日
      let endMin = r.end;
      let closeDay = day;
      if (endMin <= r.start || endMin >= 24 * 60) {
        closeDay = (day + 1) % 7;
        endMin = endMin % (24 * 60);
      }
      periods.push({
        open,
        close: { day: closeDay, hour: Math.floor(endMin / 60), minute: endMin % 60 },
      });
    }
  }
  const weekdayDescriptions = [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const ranges = byDay.get(d);
    if (!ranges) return `${dayLabel(d)}: 定休日`;
    return `${dayLabel(d)}: ${ranges.map((r) => `${fmt(r.start)}～${fmt(r.end)}`).join(", ")}`;
  });
  return { periods, weekdayDescriptions };
};

const dayLabel = (d: number) => `${["日", "月", "火", "水", "木", "金", "土"][d]}曜日`;
const fmt = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h >= 24 ? "翌" : ""}${String(h % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
