export const validatedReviewTranslations = (
  expectedIndices: number[],
  output: { index: number; text: string }[],
): Map<number, string> | null => {
  if (output.length !== expectedIndices.length) return null;
  const expected = new Set(expectedIndices);
  const translated = new Map<number, string>();
  for (const review of output) {
    if (
      !Number.isInteger(review.index) ||
      !expected.has(review.index) ||
      translated.has(review.index) ||
      !review.text.trim()
    ) {
      return null;
    }
    translated.set(review.index, review.text);
  }
  return translated;
};
