# Hyperlocal Web — Design System (locked)

公開Web（`apps/web`）のデザイン決定を固定する文書。Hallmark の pre-flight がこれを正として扱う。以降のページ改修はこのシステムに従い、変える場合はこの文書を更新する。

対象は公開Webの7種（トップ／エリア／ランキング／place詳細／guide／nearme）のみ。Admin は含まない。

## 前提

- **Audience**: 東京を訪れる・住む人のうち「いま・ここで店を決めたい」人。5言語（en / zh-cn / zh-tw / ko / ja）。
- **Use**: 1アクションは「店を選ぶ」。読ませるより選ばせる。評価・営業状態・距離が一目で分かることが正義。
- **Tone**: Utilitarian（地図・グルメサービスの機能美）。装飾は足さない。情報密度は高く、操作は迷わせない。
- **Genre**: modern-minimal。

## 色

基盤は現行の shadcn `neutral`（OKLCH）をそのまま使う。紙と文字のコントラストは触らない。

- Light: paper `oklch(1 0 0)` / ink `oklch(0.145 0 0)`（現行通り）
- Dark: paper `oklch(0.145 0 0)` / ink `oklch(0.985 0 0)`（現行通り、デフォルトは dark のまま）
- `destructive` は現行のまま。アクセントと赤系が被らないよう、アクセント候補は赤の彩度・色相から離す。

### アクセント（確定：A 藍）

用途は絞る。ランキング順位の強調、評価スター、現在地マーカー、選択中タブの下線、リンクホバー。本文のベタ塗りや広い面には使わない。

- light: `--brand: oklch(0.55 0.17 265)`、dark: `--brand: oklch(0.7 0.15 265)`
- `@theme inline` に `--color-brand` として追加済み。`accent`（shadcn のグレー）は意味のまま残す。`primary`（主操作色）は neutral のまま変えない。
- 選定理由：乗換案内・路線図の青で地図サービスの信頼感。destructive（27°）と最も遠く、エラー表示と混同しない。

## 書体

- 欧文見出し: Inter（現行通り、`font-heading` + `tracking-tight`）
- 欧文本文: system stack（現行通り）
- 日中韓の見出し: `font-heading` のフォールバックに Noto 4種を追加済み。漢字の字体差（日／韓／簡／繁）を正しく出すため `:lang(ja|ko|zh-cn|zh-tw)` ごとに見出しフォントを指定する。欧文部分は Inter が先に当たる。
  - ja: Noto Sans JP 600/700
  - ko: Noto Sans KR 600/700
  - zh-cn: Noto Sans SC 600/700
  - zh-tw: Noto Sans TC 600/700
- 読み込みは Google Fonts（`display=swap`、unicode-range 任せ）。本文の日中韓は現行のシステムフォント（ヒラギノ／Yu Gothic／Meiryo）のまま。見出しだけ Web フォントにする。
- 見出しは常に roman（italic 禁止）。強調は weight・色・下線で付ける。

## 間隔・角・影

- 4pt スケール（Tailwind 既定）。独自 spacing トークンは作らない。
- 角は `--radius: 0.625rem` 体系のまま（sm/md/lg/xl 派生も現行通り）。
- 影は使わないか、使っても `shadow-sm` まで。カードの区切りは border 中心。Utilitarian に立体感は要らない。

## コンポーネントの声

- ボタンラベルは動詞で閉じる（「保存」「閉じる」）。「OK」禁止。docs/design-policy.md に従う。
- ローディングは skeleton（`--color-muted` 面＋ shimmer なしの静的プレースホルダ優先。動きは付けない）。
- 状態表示（営業中／閉店／定休）は Badge に統一。色は緑・neutral・赤系の3択で、意味を文書化する。
- モーダルは使わない。詳細はページ遷移、一時情報は popover / toast（sonner）。
- 言語切替・現在地取得など外部リソースに触る操作は、失敗時の表示を必ず持つ（noindex の nearme も同様）。

## ページ別の型（7種）

- トップ（エリア一覧）: 索引。20エリアを等価に並べる。ヒーローは作らない。検索導線が要れば言語切替の横に置く。
- エリア: カテゴリ／シーンへの入口。記事カードは3件まで。以降は一覧へ送る。
- ランキング: 表。順位・店名・評価・件数・営業状態の5列が一目で入る。タブ（rating/review）は URL に持つ（現行通り）。
- place詳細: 1店の答え。パンくず常設。評価・件数は `rating` を小数2桁で出す（meta と統一済み）。
- guide: 記事。本文可読性優先（measure 60–70字、行間ゆったり）。店への導線は文末に集約。
- nearme: 機能。位置取得前・取得中・失敗の3状態を先に設計する。SEO対象外（noindex 維持）。
- fetcher（nearby-areas）: UI を持たない。文言辞書の直書きは現状維持（i18n ライブラリは入れない）。

## モーション

motion-cut。ライブラリは入れない。許可するのは `transition-colors`（150ms）と skeleton の静的表示まで。ページ遷移のプログレス（nprogress）は現行維持。

## 検証

- `pnpm validate`（lint/format/typecheck/test）
- `seo:check`（title・description・hreflang の崩れ検出）
- `doctor`（react-doctor。P4 で 80点目標。現行 53点）
- 目視は 375px・768px・1280px の3幅。

## 変更履歴

- 2026-09-18: 初版。アクセント色は未確定（A/B/C から選ぶ）。
- 2026-09-18: アクセントに A 藍を採用。`--color-brand` を追加。
