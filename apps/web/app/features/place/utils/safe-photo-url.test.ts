import { describe, expect, it } from "vite-plus/test";
import { safePhotoUrl } from "./safe-photo-url";

describe("safePhotoUrl", () => {
  it("allows the three known image hosts", () => {
    expect(safePhotoUrl("https://lh3.googleusercontent.com/places/x")).toBeDefined();
    expect(safePhotoUrl("https://tblg.k-img.com/x.jpg")).toBeDefined();
    expect(safePhotoUrl("https://imgfp.hotp.jp/x.jpg")).toBeDefined();
  });

  it("blocks untrusted browser requests", () => {
    expect(safePhotoUrl("https://evil.example/pixel")).toBeUndefined();
    expect(safePhotoUrl("http://imgfp.hotp.jp/x.jpg")).toBeUndefined();
    expect(safePhotoUrl("https://imgfp.hotp.jp.evil.example/x.jpg")).toBeUndefined();
  });
});
