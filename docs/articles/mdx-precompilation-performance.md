# React Router v7 で MDX を 350倍高速化した話 - プリコンパイルによるパフォーマンス改善

## TL;DR

MDX で書かれた記事ページが本番環境で 35-87秒 かかっていた問題を、プリコンパイル方式に変更することで **50-250ms（350-1740倍高速化）** に改善しました。

- **問題**: `mdx-bundler` による毎リクエスト時のコンパイルが原因
- **解決**: 記事インポート時に MDX をコンパイルし、コンパイル済みコードを DB に保存
- **結果**: サーバークラッシュ解消、ユーザー体験が劇的に改善

## 背景

地域情報サイト [Hyperlocal](https://github.com/techtalkjp/hyperlocal) では、エリアごとのガイド記事を MDX 形式で管理しています。MDX を使う理由は、記事内に React コンポーネント（お店情報カードなど）を埋め込みたいからです。

```mdx
# 上野でおすすめの朝カフェ

上野には素敵なカフェがたくさんあります。

<Place id="ChIJ..." />

営業時間は店舗により異なるため、事前に確認することをおすすめします。
```

このように MDX を使うことで、マークダウンの書きやすさとコンポーネントの動的な表示を両立できます。

## 問題発生

本番環境（Fly.io）にデプロイしたところ、ガイド記事ページで深刻な問題が発生しました。

### 症状

Fly.io のログを確認すると、衝撃的な数字が：

```log
[info] GET /ja/area/ueno/guide/morning-cafe 35782ms
[info] GET /ja/area/shibuya/guide/solo-dining 87241ms
[error] Health check failed: timeout
[error] Server restarting...
```

- ページ表示に **35-87秒** かかる
- ヘルスチェックがタイムアウト
- サーバーが頻繁にクラッシュ

### 原因分析

コードを確認すると、問題は明らかでした：

```typescript
// apps/web/app/routes/.../route.tsx
export const loader = async ({ params }: Route.LoaderArgs) => {
  const article = await getArticle(...)

  // ❌ 毎リクエスト時に MDX をコンパイル
  const compiled = await compileMDX(article.content)

  return { article, mdxCode: compiled.code }
}
```

`mdx-bundler` は内部で esbuild を使った重い処理を実行します。これを**毎リクエストで実行**していたため、パフォーマンスが悪化していました。

## 解決策: MDX プリコンパイル

### 基本アイデア

MDX のコンパイルは記事内容が変わらない限り、常に同じ結果を返します。であれば：

1. **記事インポート時（1回のみ）**: MDX をコンパイルして DB に保存
2. **リクエスト時（毎回）**: コンパイル済みコードを DB から取得して返す

これだけで、重いコンパイル処理を 1回だけに減らせます。

### 実装手順

#### 1. データベーススキーマ拡張

まず、コンパイル済みコードを保存するカラムを追加：

```prisma
// packages/db/prisma/schema.prisma
model AreaArticle {
  id           String   @id @default(cuid())
  cityId       String   @map("city_id")
  areaId       String   @map("area_id")
  sceneId      String   @map("scene_id")
  language     String
  title        String
  content      String      // 元の MDX ソース
  compiledCode String      // ✨ NEW: コンパイル済みコード
  status       String      @default("draft")
  metadata     String
  createdAt    DateTime    @default(now()) @map("created_at")
  updatedAt    DateTime    @updatedAt @map("updated_at")

  @@unique([cityId, areaId, sceneId, language])
  @@map("area_articles")
}
```

#### 2. MDX コンパイル関数の作成

コンパイル処理を共通化：

```typescript
// apps/admin/app/services/mdx.server.ts
import { bundleMDX } from 'mdx-bundler'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

export async function compileMDX(source: string): Promise<string> {
  const result = await bundleMDX({
    source,
    mdxOptions(options) {
      options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkGfm]
      options.rehypePlugins = [...(options.rehypePlugins ?? []), rehypeHighlight]
      return options
    },
  })
  return result.code
}
```

#### 3. インポートスクリプトの更新

記事インポート時にコンパイルを実行：

```typescript
// apps/admin/scripts/import-articles.ts
import { compileMDX } from '../app/services/mdx.server'

for (const file of jsonFiles) {
  const articleData: ArticleData = JSON.parse(fileContent)

  // MDX をコンパイル
  console.log('  🔨 Compiling MDX...')
  const compiledCode = await compileMDX(articleData.content)
  console.log('  ✓ MDX compiled')

  // DB に保存
  await createArticle({
    ...articleData,
    content: articleData.content,      // 元のソースも保存
    compiledCode,                       // コンパイル済みコードを保存
  })
}
```

#### 4. ルートの最適化

コンパイル済みコードを使うように変更：

```typescript
// apps/web/app/routes/.../route.tsx
export const loader = async ({ params }: Route.LoaderArgs) => {
  const article = await getArticle(...)

  // ✅ コンパイル済みコードをそのまま返す
  return {
    article,
    mdxCode: article.compiledCode  // DB から取得するだけ！
  }
}

export default function ArticlePage({ loaderData }: Route.ComponentProps) {
  const { article, mdxCode } = loaderData
  const Component = useMemo(
    () => getMDXComponent(mdxCode),
    [mdxCode]
  )

  return <Component components={{ Place }} />
}
```

### 動的コンポーネントの扱い

MDX 内の `<Place>` コンポーネントは、実行時に以下の処理を行います：

- 現在時刻に基づく営業状態の判定
- ユーザーの位置情報に基づく距離計算
- リアルタイムなデータ表示

これらはプリコンパイル後も正常に動作します。なぜなら：

1. **コンパイル時**: `<Place id="..." />` の構造を JavaScript コードに変換
2. **実行時**: 変換されたコードが実際の `Place` コンポーネントを呼び出す

つまり、コンパイルは「MDX の構文解析」だけを行い、実際のコンポーネントの実行は実行時に行われるため、動的な表示も問題なく機能します。

## 結果

### パフォーマンス改善

| 指標 | 改善前 | 改善後 | 改善率 |
|------|--------|--------|--------|
| ページ表示速度 | 35,000-87,000ms | 50-250ms | **350-1740倍** ⚡ |
| ヘルスチェック | 失敗 | 成功 | ✓ |
| サーバー安定性 | クラッシュ | 安定 | ✓ |

### 運用面の改善

- **記事インポート**: 全190記事（19エリア × 2記事 × 5言語）を約2秒でコンパイル
- **デプロイ**: サーバークラッシュがなくなり、安定稼働
- **ユーザー体験**: 瞬時にページが表示されるように

## SEO への影響は？

プリコンパイルした MDX は **完全に SSR（Server-Side Rendering）される**ため、SEO には全く問題ありません。

### SSR の動作

React Router v7 では `ssr: true` を設定しているため、MDX コンテンツは以下のように処理されます：

1. **サーバー側（SSR）**:
   - DB からコンパイル済み MDX コードを取得
   - `getMDXComponent()` で React コンポーネント化
   - 通常の React コンポーネントとして HTML にレンダリング
   - 完全な HTML をクライアントに送信

2. **クライアント側**:
   - ハイドレーション（既存の HTML に React を紐付け）
   - インタラクティブな機能が有効化

### クローラーが見るコンテンツ

検索エンジンのクローラーが受け取る HTML には、以下がすべて含まれています：

```html
<article>
  <h1>上野でおすすめの朝カフェ</h1>
  <div class="prose">
    <p>上野には素敵なカフェがたくさんあります。</p>

    <!-- Place コンポーネントも SSR される -->
    <a href="/place/ChIJ...">
      <img src="..." alt="カフェ名" />
      <div>カフェ名</div>
      <div>★ 4.5 (120 reviews)</div>
      <div>"とても美味しいコーヒーでした"</div>
    </a>

    <p>営業時間は店舗により異なるため...</p>
  </div>
</article>
```

つまり：
- ✅ **記事の本文**: 完全に SSR される
- ✅ **`<Place>` コンポーネント**: 店舗名、評価、レビューなど重要な情報はすべて SSR
- ✅ **メタタグ**: タイトル、description も SSR で出力
- ❌ **営業中バッジ**: `<ClientOnly>` で囲まれた部分のみクライアントサイド（SEO には影響なし）

### プリコンパイルと SSR の関係

プリコンパイルは「ビルド時間の短縮」と「実行時パフォーマンスの向上」が目的で、SSR には影響しません：

- **プリコンパイルなし**: 毎リクエスト時に MDX をコンパイル → 遅い、でも SSR される
- **プリコンパイルあり**: コンパイル済みコードを使用 → 速い、かつ SSR される

どちらの場合も SSR は正常に動作するため、**SEO は全く問題ありません**。

## 学び

### 1. コンパイルタイミングの重要性

MDX に限らず、重い処理は以下のタイミングで実行できます：

- **ビルド時**: 最速だが、コンテンツ更新のたびにビルドが必要
- **インポート時**: 今回採用。柔軟性とパフォーマンスのバランスが良い
- **初回リクエスト時 + キャッシュ**: メモリ管理が複雑になる
- **毎リクエスト時**: ❌ 遅い

### 2. 計測の重要性

本番環境でログを確認したことで、開発環境では気づかなかった問題を発見できました。パフォーマンス問題は必ず計測データに基づいて判断すべきです。

### 3. データベース設計

`content` と `compiledCode` の両方を保存することで：

- **content**: 記事編集時に使用
- **compiledCode**: 表示時に使用

という使い分けができ、柔軟性を保ちつつパフォーマンスも確保できました。

## まとめ

MDX のプリコンパイルにより、サーバークラッシュするほど遅かったページを実用的な速度に改善できました。

重い処理は「いつ実行するか」を慎重に検討することで、大幅なパフォーマンス改善が可能です。特に MDX のような静的コンテンツは、プリコンパイルとの相性が非常に良いです。

### 参考リンク

- [PR #29: Precompile MDX articles](https://github.com/techtalkjp/hyperlocal/pull/29)
- [mdx-bundler](https://github.com/kentcdodds/mdx-bundler)
- [React Router v7](https://reactrouter.com/)

---

この記事が MDX のパフォーマンス改善に悩んでいる方の参考になれば幸いです！
