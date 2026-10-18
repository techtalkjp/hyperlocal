import type { CheerioCrawlerOptions } from "crawlee";

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

export const canFollowTabelogRedirect = (
  location: string | undefined,
  currentUrl: string,
): boolean => safeTabelogUrl(location ?? "", currentUrl) !== undefined;

export const restrictTabelogNavigation: NonNullable<
  CheerioCrawlerOptions["preNavigationHooks"]
>[number] = ({ request }, gotOptions) => {
  if (!safeTabelogUrl(request.url)) {
    throw new Error(`Refusing non-Tabelog request: ${request.url}`);
  }
  gotOptions.followRedirect = (response) =>
    canFollowTabelogRedirect(response.headers.location, response.url);
};
