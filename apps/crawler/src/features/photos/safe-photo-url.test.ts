import { describe, expect, it } from "vite-plus/test";
import { safePhotoUrl } from "./safe-photo-url";

describe("safePhotoUrl", () => {
  it.each([
    "https://lh3.googleusercontent.com/places/example=s400",
    "https://tblg.k-img.com/restaurant/images/example.jpg",
    "https://imgfp.hotp.jp/IMGH/43/97/example.jpg",
  ])("accepts a known image host: %s", (value) => {
    expect(safePhotoUrl(value)).toBe(value);
  });

  it.each([
    "http://imgfp.hotp.jp/IMGH/example.jpg",
    "https://imgfp.hotp.jp.evil.example/photo.jpg",
    "https://evil.example/tracker",
    "data:image/svg+xml,<svg/>",
    "https://imgfp.hotp.jp:444/photo.jpg",
  ])("rejects an untrusted image URL: %s", (value) => {
    expect(safePhotoUrl(value)).toBeUndefined();
  });
});
