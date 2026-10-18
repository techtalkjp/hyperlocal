# Shannon 監査の再実行

公開サイトと管理画面を、コミット済みソースの複製と合成 SQLite だけで動かして Shannon で調べる。実行環境と報告書は `.cache/security-audit/` に置き、Git には含めない。アプリ用コンテナは Docker の internal network だけに接続する。外部からのアクセスは、ローカルホストの `4174`（公開サイト）と `4176`（管理画面）に公開する試験用ゲートウェイを通す。

## 準備

- Docker、Git、Python 3、Node.js、Corepack を使えるようにする。
- [Shannon の認証設定](https://github.com/KeygraphHQ/shannon/blob/main/docs/ai-providers.md)に従い、Pi で OpenAI Codex にログインする。認証ファイルや API キーをリポジトリへ置かない。
- `bash tools/security-audit/setup-shannon.sh` で、今回の監査に使った Shannon のコミット `2468b67d9e40d70d0b189462c5041c24e1dc886c` と互換 Pi パッケージをキャッシュへビルドする。既に動作する Shannon がある場合は `SHANNON_BIN=/absolute/path/to/shannon` で指定できる。
- スキャンする修正をコミットする。未コミットの変更や、Git 管理された認証ファイル・実データがあれば開始を拒否する。

## 実行

両アプリを準備し、モデル・管理画面ログインを検証してから順にスキャンする。終了時に今回作成したコンテナとネットワークだけを削除する。1回の監査には時間とモデル利用枠が必要になる。

```bash
python3 tools/security-audit/run.py run --run-dir .cache/security-audit/manual-001
```

段階的に実行する場合:

```bash
python3 tools/security-audit/run.py prepare --run-dir .cache/security-audit/manual-001
python3 tools/security-audit/run.py validate --run-dir .cache/security-audit/manual-001
python3 tools/security-audit/run.py scan --run-dir .cache/security-audit/manual-001 --target all
python3 tools/security-audit/run.py clean --run-dir .cache/security-audit/manual-001
```

`--target web` と `--target admin` で片方ずつ実行できる。`SHANNON_AI_MODEL` の既定は `openai:gpt-6-sol`、認証方式の既定は `SHANNON_USE_PI_AUTH=1`。別モデルを使う場合は環境変数で指定する。レポートは実行ディレクトリの `reports/web/` と `reports/admin/` に保存され、実行ディレクトリを削除するまで残る。報告書には検証内容が含まれるため、公開リポジトリへそのままコミットしない。

## スキャン範囲と限界

- Docker イメージは現在のブランチの HEAD を shallow clone して作る。ホストの `.env`、`.dev.vars`、`data/`、未コミットファイルをコピーしない。
- 毎回新しい合成 DB とランダムなセッションを作る。`/_audit/login` はゲートウェイだけにあるダミー認証画面で、管理画面の本番コードには含まれない。
- `web.yaml` と `admin.yaml` は実証を有効にし、アクセス先・速度・対象外操作を制限する。URL やポートを変えるときは両設定と `run.py` を合わせて更新する。
- アプリは Cloudflare Workers/D1 ではなく Node 開発サーバーと SQLite で動く。Google OAuth、公開 R2 の実データ、Worker/エッジ固有の挙動は別途確認する。
- スキャン後は `status` が complete で、出力先に `report.json` がある場合だけ成功とする。Shannon の静的解析結果は動的な実証と分けて確認する。

2026-10-18 の監査結果と個別対応は [親イシュー #66](https://github.com/techtalkjp/hyperlocal/issues/66) にある。
