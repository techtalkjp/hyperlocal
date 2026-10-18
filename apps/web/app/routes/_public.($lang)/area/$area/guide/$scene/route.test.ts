import { beforeEach, expect, it, vi } from "vite-plus/test";
import { loader } from "./route";

const mocks = vi.hoisted(() => ({
  readShard: vi.fn(),
  getArticle: vi.fn(),
  getLocalizedPlacesByIds: vi.fn(),
  getOtherArticlesForArea: vi.fn(),
}));

vi.mock("~/features/shards/reader", () => ({ readShard: mocks.readShard }));
vi.mock("./+queries.server", () => ({
  getArticle: mocks.getArticle,
  getLocalizedPlacesByIds: mocks.getLocalizedPlacesByIds,
  getOtherArticlesForArea: mocks.getOtherArticlesForArea,
}));

const published = {
  id: "published",
  cityId: "tokyo",
  areaId: "shibuya",
  sceneId: "morning-cafe",
  language: "en",
  title: "Published article",
  content: "# Published",
  compiledCode: "",
  status: "published",
  metadata: { description: "Published" },
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

const load = () =>
  loader({
    request: new Request("http://tokyo.hyper-local.app/area/shibuya/guide/morning-cafe"),
    params: { area: "shibuya", scene: "morning-cafe" },
  } as Parameters<typeof loader>[0]);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getArticle.mockResolvedValue(published);
  mocks.getLocalizedPlacesByIds.mockResolvedValue([]);
  mocks.getOtherArticlesForArea.mockResolvedValue([]);
});

it("uses the published database article when a stale guide shard contains a draft", async () => {
  mocks.readShard.mockResolvedValue({ ...published, title: "Draft article", status: "draft" });

  const result = await load();

  expect(result.article.title).toBe("Published article");
  expect(mocks.getArticle).toHaveBeenCalledOnce();
});

it("uses the database when a legacy guide index has no publication status", async () => {
  mocks.readShard.mockImplementation(async (path: string) => {
    if (path.startsWith("guide-index/")) return [{ sceneId: "draft-scene", title: "Draft" }];
    if (path.startsWith("guide/")) return { ...published, title: "Old shard", placeIds: [] };
    return null;
  });

  const result = await load();

  expect(result.article.title).toBe("Published article");
  expect(result.otherArticles).toEqual([]);
  expect(mocks.getArticle).toHaveBeenCalledOnce();
});
