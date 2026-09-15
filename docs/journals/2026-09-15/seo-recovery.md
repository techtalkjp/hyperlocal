# Google SEO インデックス激減の診断と復旧記録

## 発端

2026年9月15日、Google SEO が壊滅状態にあるとの報告を受けた。症状はインデックスの激減であり、まずは状況を AI と共有できる形にすること、そして運用のためのスクリプトをリポジトリに残すことが求められた。

## 診断の経緯

最初に疑ったのは前日9月14〜15日の動的 SSR 移行(PR #54)である。それまで静的プリレンダー(`ssr: false` + 全パス事前生成)で Google に完全な HTML を渡していたものが、Cloudflare Workers 上の動的 SSR + エッジキャッシュに切り替わっていた。切替自体は正当だが、切替前から蓄積していた問題を露呈させた。

特定のため、リポジトリに現状把握スクリプト `apps/web/scripts/seo-check.ts`(`pnpm --filter @hyperlocal/web seo:check`)を追加した。robots.txt、sitemap、代表 URL の canonical・hreflang・title・応答速度を叩き、AI に貼れる Markdown レポートを出すものである。これに Search Console の実データ(カバレッジのドリルダウン、サイトマップ画面、クロール統計)を突き合わせ、次の5つの事実を確定した。

第一に、Google はほとんどクロールに来ていなかった。3か月で約240リクエスト、HTML はわずか3.3%、新規発見はゼロである。

第二に、クロールの約25%が DNS エラーで捨てられていた。`hyper-local.app` の apex に A レコードが存在せず、apex 宛の61件が全滅していた。

第三に、sitemap が10か月再読込されていなかった。最終読み込みは2025年11月18日であり、記事や URL の更新は Google に届いていなかった。

第四に、sitemap が欠陥 URL を給餌していた。nearme 系ページは位置情報依存の個別化コンテンツであるにもかかわらず sitemap に含まれ、しかも SSR 時には `clientLoader.hydrate` と meta の早期リターンの組み合わせで title なしの空 head を200で返していた。guide 系190件(38件×5言語)は canonical も hreflang もなかった。sitemap全体の4〜5割が「出すべきでない形で出ている」状態だった。

第五に、place 詳細19,400件が sitemap にゼロ件だった。プリレンダー時代には数千件が静的生成・インデックスされていたはずが、発見経路は内部リンクのみになっていた。

結論として、壊滅は SSR 移行の一発ではなく、移行前からのクロール縮小と移行による sitemap・meta 欠陥の複合である。

## 決定事項

診断を受け、次の方針を決定した。

nearme 系は SEO 対象外とする。位置情報で並び替える個別化ページは検索結果に置く意味がなく、空 head のまま置く害のほうが大きい。sitemap から除外し、`noindex, follow` を付与する。SSR 時に `loaderData` が空でも noindex だけは常に出力するフォールバックを入れる。

guide 系と place 詳細は正規化して残す。canonical と hreflang を付与し、sitemap に載せる価値のある形にする。place 詳細には評価・レビュー件数を使った description を付ける。

sitemap の衛生を保つ。記事ゼロの言語でも空 urlset を書き出して index→404 の不整合をなくし、place は言語別5本(各約3,900件、5万件上限内)で復活させる。

apex と www は `tokyo` へ301で集約する。DNS エラーの解消と評価の集約が目的であり、Cloudflare のリダイレクトルールでパス保持・クエリ保持・301に設定する。コードでは直せないためダッシュボード作業とした。

運用はスクリプト化する。本番 HTML の監視に `seo:check`、Search Console の定期取得に `seo:sc`(perf/sitemaps/submit/inspect)を用いる。サービスアカウントの鍵は `data/sc-service-account.json`(パーミッション600、`data/` は gitignore 済み)に置き、`.env` から参照する。GCP の IAM ロールは不要であり、権限は Search Console 側の所有者追加で足りる。

## 実施内容

同日中に次のプルリクエストを作成・マージし、すべて本番反映を確認した。

- #59: nearme の sitemap 除外と noindex、guide の canonical・hreflang、articles 空404防止、`seo:check` 追加
- #60: SSR 時に loaderData が空でも noindex を出すフォールバック
- #61: place sitemap 復活と place 詳細 meta の description・hreflang
- #62: `seo:sc` 追加(perf/sitemaps/inspect、スナップショットは `data/seo/`)
- #63: `seo:sc` の env 読込と pnpm の `--` 扱いの修正
- #64: `seo:sc submit` による sitemap 再送信

インフラ側では apex と www の A レコード(ダミー `192.0.2.1`、Proxy ON)と `apex-to-tokyo` リダイレクトルールを設定し、301の動作を curl で確認した。Search Console では sitemap を再送信し、同日中の再読込を確認した。直近28日の実績は clicks・impressions ともにゼロであり、ここからの回復を追う基準点とした。

## 残タスクと定常運用

効果の確認には数日〜数週間を要する。週1回を目安に `seo:check` と `seo:sc -- perf`、`seo:sc -- sitemaps` を回し、impressions がゼロから動くか、子 sitemap の最終読み込みが更新されるかを見る。主要ページのインデックス登録リクエストは上限に注意して数件ずつ行う。

## 運用上の反省

作業中に main への直接コミットを1件行ってしまった。直ちにブランチへ移し替えて PR 経由に是正したが、小さな修正であっても feature ブランチを切る手順を省略しないこと。
