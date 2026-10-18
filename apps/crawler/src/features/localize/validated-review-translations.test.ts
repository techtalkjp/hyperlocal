import { describe, expect, it } from "vite-plus/test";
import { validatedReviewTranslations } from "./validated-review-translations";

describe("validatedReviewTranslations", () => {
  it("maps the requested review indices regardless of output order", () => {
    expect([
      ...validatedReviewTranslations(
        [0, 2],
        [
          { index: 2, text: "second" },
          { index: 0, text: "first" },
        ],
      )!,
    ]).toEqual([
      [2, "second"],
      [0, "first"],
    ]);
  });

  it.each([
    { output: [{ index: 0, text: "only one" }] },
    {
      output: [
        { index: 0, text: "first" },
        { index: 0, text: "duplicate" },
      ],
    },
    {
      output: [
        { index: 0, text: "first" },
        { index: 99, text: "invented" },
      ],
    },
    {
      output: [
        { index: 0.5, text: "fraction" },
        { index: 2, text: "second" },
      ],
    },
    {
      output: [
        { index: 0, text: " " },
        { index: 2, text: "second" },
      ],
    },
  ])("rejects mismatched output: $output", ({ output }) => {
    expect(validatedReviewTranslations([0, 2], output)).toBeNull();
  });
});
