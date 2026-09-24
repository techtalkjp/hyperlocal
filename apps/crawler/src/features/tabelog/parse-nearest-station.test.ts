import { describe, expect, test } from "vite-plus/test";
import { parseNearestStation } from "./parse-nearest-station";

describe("parseNearestStation", () => {
  test("plain tail", () => {
    expect(parseNearestStation("市ケ谷駅から225m")).toEqual({ station: "市ケ谷駅", meters: 225 });
  });
  test("long access text then tail", () => {
    expect(
      parseNearestStation(
        "地下鉄 半蔵門線 半蔵門駅 １番出口より徒歩２分地下鉄 有楽町線 麹町駅 ２番出口より徒歩１分 半蔵門駅から252m",
      ),
    ).toEqual({ station: "半蔵門駅", meters: 252 });
  });
  test("parenthesised line note", () => {
    expect(parseNearestStation("浅草駅（東武・都営・メトロ）から227m")).toEqual({
      station: "浅草駅",
      meters: 227,
    });
  });
  test("no tail", () => {
    expect(parseNearestStation("都営浅草線浅草駅から徒歩５分")).toBeNull();
    expect(parseNearestStation("")).toBeNull();
  });
});
