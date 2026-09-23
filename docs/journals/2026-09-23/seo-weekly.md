# SEO 定点観測(9/23): rank 系 sitemap の再送信と impressions の初動

9月15日の復旧作業で定めた週1回の定点観測の初回である。基準点だった clicks・impressions ともにゼロから動きがあるか、子 sitemap の最終読み込みが更新されているかを見ることが目的だった。

## 本番 HTML の監視は異常なし

まず `seo:check` で robots.txt、sitemap、代表49 URL の canonical・hreflang・title・description・応答速度を叩いた。49件すべて200で返り、自動検出の問題はゼロだった。動的 SSR 移行後に問題になっていた空 head や正規化漏れは起きていない。

## rank 系 sitemap だけ10か月放置されていた

`seo:sc sitemaps` を見ると、place 系と articles 系の10本は9月18〜21日に再読込され、エラーも警告もゼロだった。復旧時に再送信したものが Google に読まれ続けている。

一方で rank 系の5本(`rank-en/ja/ko/zh-cn/zh-tw`)だけ最終読込が2025年11月18日で止まっていた。9月15日の診断で「sitemap が10か月再読込されていなかった」と書いたのとまったく同じ状態が、rank 系だけ残っていた形である。さらに Search Console 側の検出件数は362件なのに対し、現在の実ファイルは各248件で、内容のズレも生じていた。更新が届いていないのだから当然ではある。

このため5本すべてを `seo:sc submit --feedpath` で再送信した。9月15日の #64 と同じ手順である。再読込には数分から数日かかるため、効果の確認は次回以降の観測に回す。

## impressions がゼロから動いた

`seo:sc perf` の直近28日では clicks 0、impressions 1(前回比+1)だった。クエリは `hyperlocal`、対象は apex の `http://hyper-local.app/`、掲載順位は81位である。まだ誤差のような数字だが、9月15日時点の完全なゼロからは初めての動きであり、クロール再開と sitemap 再送信が実績に反映され始めた兆しと読める。

## place 件数減の原因: 9/16〜17の再ingest

place 系 sitemap の件数は現在は各言語2,203〜2,205件で、9月15日の記録にあった約3,900件から減っている。公開中の shard manifest(`version 202609171627`、9月17日発行)の `place: 11018`(5言語合計)とも一致するため、給餌の不具合ではない。

タイムラインを追うと、9月16日の `Google-free ingest: Tabelog-direct staging writer`、9月17日の `Ingest guards: skip unscored new`・`Localize by URL join`・`DuckDB脱Google-ID` という再ingestの一連があり、直後に shard が再発行されている。つまり9/15〜9/17の間にデータが新しいパイプラインで作り直され、スコアなし新規の除外や URL 突合への切替で約1,700件/言語が落ちたものと見られる。意図した絞り込みの範囲内だが、どのガードで何件落ちたかの内訳は取っていない。必要なら新旧の place 集合差分で特定できる。

## 次回

rank 系5本の最終読込が更新されたかを `seo:sc sitemaps` で確認する。impressions が1から積み上がるかも `seo:sc perf` で追う。主要ページのインデックス登録リクエストは上限に注意しながら数件ずつでよい。
