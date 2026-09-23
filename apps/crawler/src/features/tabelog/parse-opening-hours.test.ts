import { describe, expect, test } from "vite-plus/test";
import { parseTabelogOpeningHours } from "./parse-opening-hours";

describe("parseTabelogOpeningHours", () => {
  test("weekday groups with lunch/dinner and L.O.", () => {
    const r = parseTabelogOpeningHours(
      "月・火・水・木・金 11:30 - 15:00 L.O. 14:30 17:00 - 21:00 L.O. 20:30 土・日・祝日 11:30 - 17:00 L.O. 16:30 月 定休日 ■ 定休日月曜日 営業時間・定休日は変更となる場合がございます",
    );
    expect(r).not.toBeNull();
    // 月〜金 2枠 ×5 + 土日 1枠 ×2 = 12
    expect(r?.periods).toHaveLength(12);
    const mon = r?.periods.filter((p) => p.open.day === 1);
    expect(mon).toEqual([
      { open: { day: 1, hour: 11, minute: 30 }, close: { day: 1, hour: 15, minute: 0 } },
      { open: { day: 1, hour: 17, minute: 0 }, close: { day: 1, hour: 21, minute: 0 } },
    ]);
    expect(r?.weekdayDescriptions[6]).toBe("日曜日: 11:30～17:00");
  });

  test("no weekday means every day", () => {
    const r = parseTabelogOpeningHours("09:00 - 22:30");
    expect(r?.periods).toHaveLength(7);
    expect(r?.periods[0]).toEqual({
      open: { day: 0, hour: 9, minute: 0 },
      close: { day: 0, hour: 22, minute: 30 },
    });
  });

  test("overnight close rolls to next day", () => {
    const r = parseTabelogOpeningHours(
      "月・火・水・木・金 14:00 - 05:00 土・日・祝日 12:00 - 05:00",
    );
    const fri = r?.periods.find((p) => p.open.day === 5);
    expect(fri?.close).toEqual({ day: 6, hour: 5, minute: 0 });
    const sat = r?.periods.find((p) => p.open.day === 6);
    expect(sat?.close).toEqual({ day: 0, hour: 5, minute: 0 });
  });

  test("midnight close 00:00 is next day 0:00, 翌1:00 supported", () => {
    const r = parseTabelogOpeningHours("月・火・水・木・金・土 18:00 - 00:00 日 17:00～翌1:00");
    const mon = r?.periods.find((p) => p.open.day === 1);
    expect(mon?.close).toEqual({ day: 2, hour: 0, minute: 0 });
    const sun = r?.periods.find((p) => p.open.day === 0);
    expect(sun?.close).toEqual({ day: 1, hour: 1, minute: 0 });
  });

  test("closed day has no period and is described as 定休日", () => {
    const r = parseTabelogOpeningHours(
      "火・水・木・金・土・日・祝日 11:30 - 14:30 18:00 - 22:00 月 定休日",
    );
    expect(r?.periods.some((p) => p.open.day === 1)).toBe(false);
    expect(r?.weekdayDescriptions[0]).toBe("月曜日: 定休日");
  });

  test("24h", () => {
    const r = parseTabelogOpeningHours("24時間営業");
    expect(r?.periods).toEqual([{ open: { day: 0, hour: 0, minute: 0 } }]);
  });

  test("free text only returns null", () => {
    expect(parseTabelogOpeningHours("営業時間・定休日は変更となる場合がございますので")).toBeNull();
    expect(parseTabelogOpeningHours("")).toBeNull();
    expect(parseTabelogOpeningHours(undefined)).toBeNull();
  });

  test("free text after ■ with (月) does not create bogus days", () => {
    const r = parseTabelogOpeningHours(
      "月・火・水・木・金 15:00 - 23:30 土・日・祝日 12:00 - 23:30 〇社内研修のため2026年2/23(月) は14時オープン ■定休日：なし",
    );
    expect(r?.periods).toHaveLength(7);
  });
});
