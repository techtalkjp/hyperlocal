const IMAGE_HOSTS = new Set(["lh3.googleusercontent.com", "tblg.k-img.com", "imgfp.hotp.jp"]);

export const safePhotoUrl = (value: string | null | undefined): string | undefined => {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !IMAGE_HOSTS.has(url.hostname) || url.port) {
      return undefined;
    }
    return url.href;
  } catch {
    return undefined;
  }
};
