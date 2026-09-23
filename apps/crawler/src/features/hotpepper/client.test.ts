import { describe, expect, test } from "vite-plus/test";
import { nameSimilarity, normalizeName } from "./client";

describe("hotpepper name matching", () => {
  test("normalizeName strips width, spaces, symbols and readings", () => {
    expect(normalizeName("ル・グルニエ・ア・パン 麹町店")).toBe("ルグルニエアパン麹町店");
    expect(normalizeName("VIRON 渋谷店\n（ヴィロン）")).toBe("viron渋谷店");
    expect(normalizeName("Ｃａｆｅ　ＡＢＣ")).toBe("cafeabc");
  });
  test("similarity", () => {
    expect(nameSimilarity("ぐつぐつ 麹町店", "ぐつぐつ麹町店")).toBe(1);
    expect(nameSimilarity("麹町 おうどん 開", "おうどん 開 麹町店")).toBeGreaterThan(0.6);
    expect(nameSimilarity("鮨 忠", "焼鳥 忠")).toBeLessThan(0.6);
    expect(nameSimilarity("No.4", "ナンバーフォー")).toBeLessThan(0.3);
  });
});
