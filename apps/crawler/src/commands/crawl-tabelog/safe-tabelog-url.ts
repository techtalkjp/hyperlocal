export const safeTabelogUrl = (href: string, base?: string): string | undefined => {
  if (!href.trim()) return undefined;
  try {
    const url = new URL(href, base);
    if (url.protocol !== "https:" || url.hostname !== "tabelog.com" || url.port) {
      return undefined;
    }
    return url.href;
  } catch {
    return undefined;
  }
};
