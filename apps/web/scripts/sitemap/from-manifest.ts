import { UTCDate } from "@date-fns/utc";
import { format } from "date-fns";

export interface ShardManifest {
  version: string;
  publishedAt: string;
  counts: Record<string, number>;
  bytes: number;
  files: Record<string, string>;
}

export const fetchManifest = async (baseUrl: string): Promise<ShardManifest> => {
  const url = `${baseUrl.replace(/\/+$/, "")}/shards/manifest.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`manifest fetch failed: ${res.status} ${url}`);
  }
  const manifest = (await res.json()) as ShardManifest;
  if (!manifest.version || !manifest.files) {
    throw new Error(`invalid manifest: ${url}`);
  }
  return manifest;
};

const langPrefix = (langId: string) => (langId === "en" ? "" : `/${langId}`);

const lastmodOf = (manifest: ShardManifest) =>
  format(new UTCDate(manifest.publishedAt), "yyyy-MM-dd'T'HH:mm:ssXXX");

const entry = (loc: string, lastmod: string, priority?: number) =>
  `<url>
  <loc>${loc}</loc>
  <lastmod>${lastmod}</lastmod>${priority !== undefined ? `\n  <priority>${priority}</priority>` : ""}
</url>
`;

export const generateRankSitemap = (
  origin: string,
  langId: string,
  manifest: ShardManifest,
): string => {
  const lastmod = lastmodOf(manifest);
  const urls: string[] = [entry(`${origin}${langId === "en" ? "/" : `/${langId}`}`, lastmod, 1.0)];

  const prefix = `listing/${langId}/`;
  const areas = new Set<string>();
  for (const key of Object.keys(manifest.files)) {
    if (!key.startsWith(prefix) || !key.endsWith(".json")) continue;
    // listing/{lang}/{area}/{category}/{rank}.json
    const [, , area, category, rankFile] = key.split("/");
    const rank = rankFile.replace(/\.json$/, "");
    if (rank === "nearme") continue;
    areas.add(area);
    urls.push(
      entry(`${origin}${langPrefix(langId)}/area/${area}/${category}/${rank}`, lastmod, 0.6),
    );
  }
  for (const area of [...areas].sort()) {
    urls.push(entry(`${origin}${langPrefix(langId)}/area/${area}`, lastmod, 0.8));
  }

  return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("")}</urlset>`;
};

export const generateArticlesSitemap = (
  origin: string,
  langId: string,
  manifest: ShardManifest,
): string => {
  const lastmod = lastmodOf(manifest);
  const prefix = `guide/${langId}/`;
  const urls: string[] = [];
  for (const key of Object.keys(manifest.files)) {
    if (!key.startsWith(prefix) || !key.endsWith(".json")) continue;
    // guide/{lang}/{area}/{scene}.json
    const [, , area, sceneFile] = key.split("/");
    const scene = sceneFile.replace(/\.json$/, "");
    urls.push(entry(`${origin}${langPrefix(langId)}/area/${area}/guide/${scene}`, lastmod, 0.7));
  }
  if (urls.length === 0) return "";
  return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("")}</urlset>`;
};

export const generatePlaceSitemap = (
  origin: string,
  langId: string,
  manifest: ShardManifest,
): string => {
  const lastmod = lastmodOf(manifest);
  const prefix = `place/${langId}/`;
  const urls: string[] = [];
  for (const key of Object.keys(manifest.files)) {
    if (!key.startsWith(prefix) || !key.endsWith(".json")) continue;
    // place/{lang}/{placeId}.json（形式外は捨てる）
    const placeId = key.split("/")[2]?.replace(/\.json$/, "");
    if (!placeId) continue;
    urls.push(entry(`${origin}${langPrefix(langId)}/place/${placeId}`, lastmod));
  }
  return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("")}</urlset>`;
};
