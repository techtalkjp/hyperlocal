// Google Maps Platform APIは課金対象のため、明示的なopt-inなしでは呼ばない。
// 使う場合は GOOGLE_API_ENABLED=1 をenvに設定すること。
// (方針: Google依存ゼロ。Tabelog/HotPepper/GSIで代替)
export const assertGoogleApiEnabled = (): void => {
  if (process.env.GOOGLE_API_ENABLED !== "1") {
    throw new Error(
      "Google API is disabled by policy (would incur billing). Set GOOGLE_API_ENABLED=1 to opt in explicitly.",
    );
  }
};
