import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// R2 shard publish (export-shards.ts の出力を配布する)
// 使い方:
//   pnpm tsx scripts/publish-shards.ts --dir /tmp/shards --dry-run
//   pnpm tsx scripts/publish-shards.ts --dir /tmp/shards --purge
// 必要なenv: R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
// purge用 (任意): SITE_URL, PURGE_SECRET (なければ手動curl文を表示)
//
// - 版prefix shards/{version}/ に配置。manifest.jsonは最後に更新
// - HEADでETag(md5)比較し、同一内容はPUTしない (Class A節約)
// - 版付きは immutable 1年、manifestは60秒でCache-Control

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const dir = flag("--dir");
const dryRun = args.includes("--dry-run");
const doPurge = args.includes("--purge");
if (!dir) {
  throw new Error("--dir <export-shards out dir> is required");
}

const manifestLocal = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8")) as {
  version: string;
};
const version = manifestLocal.version;

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});
const Bucket = process.env.R2_BUCKET_NAME ?? "";

// 同版への内容変更は禁止 (版付きはimmutable cache)。変えたい場合は新版を切る。
// 公開中manifestと同版でhashが1件でも違えばabort。
const publicBase = (process.env.R2_PUBLIC_URL ?? "").replace(/\/+$/, "");
if (publicBase && !dryRun) {
  try {
    const mfRes = await fetch(`${publicBase}/shards/manifest.json`);
    if (!mfRes.ok) {
      throw new Error(`remote manifest HTTP ${mfRes.status} (first publish?)`);
    }
    const remote = (await mfRes.json()) as {
      version: string;
      files: Record<string, string>;
    };
    if (remote.version === version) {
      const localManifest = JSON.parse(
        fs.readFileSync(path.join(dir, "manifest.json"), "utf8"),
      ) as { files: Record<string, string> };
      const changed = Object.entries(localManifest.files).filter(
        ([k, h]) => remote.files[k] && remote.files[k] !== h,
      );
      if (changed.length > 0) {
        console.error(
          `ABORT: version ${version} already published with different content (${changed.length} files differ, e.g. ${changed[0][0]}). Cut a new version instead.`,
        );
        process.exit(1);
      }
    }
  } catch (e) {
    if ((e as Error).message.startsWith("ABORT")) throw e;
    console.log("remote manifest check skipped:", (e as Error).message.slice(0, 120));
  }
}

const walk = (d: string): string[] =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

const md5 = (buf: Buffer) => createHash("md5").update(buf).digest("hex");

// manifest以外の版ファイルを列挙 (manifestは最後)
const versionFiles = walk(path.join(dir, version));
let put = 0;
let skipped = 0;
let bytes = 0;

const putOne = async (key: string, body: Buffer, cacheControl: string) => {
  if (!dryRun) {
    try {
      const head = await s3.send(new HeadObjectCommand({ Bucket, Key: key }));
      if ((head.ETag ?? "").replaceAll('"', "") === md5(body)) {
        skipped++;
        return;
      }
    } catch {
      // missing -> put
    }
    await s3.send(
      new PutObjectCommand({
        Bucket,
        Key: key,
        Body: body,
        ContentType: "application/json; charset=utf-8",
        CacheControl: cacheControl,
      }),
    );
  }
  put++;
  bytes += body.length;
};

// 並列度10でPUT
const queue = versionFiles.map((f) => ({
  key: `shards/${version}/${path.relative(path.join(dir, version), f)}`,
  file: f,
}));
for (let i = 0; i < queue.length; i += 25) {
  await Promise.all(
    queue.slice(i, i + 25).map(async ({ key, file }) => {
      await putOne(key, fs.readFileSync(file), "public, max-age=31536000, immutable");
    }),
  );
  if ((i / 10) % 20 === 0) console.log(`  ${Math.min(i + 10, queue.length)}/${queue.length}`);
}

// manifestは最後に更新 (読者が未配置版を掴まないため)
await putOne(
  "shards/manifest.json",
  fs.readFileSync(path.join(dir, "manifest.json")),
  "public, max-age=60",
);

console.log(
  JSON.stringify(
    {
      version,
      put,
      skipped,
      bytes,
      estUsd: ((put * 4.5) / 1e6).toFixed(4),
      dryRun,
    },
    null,
    2,
  ),
);

if (doPurge && !dryRun) {
  const site = process.env.SITE_URL ?? "https://tokyo.hyper-local.app";
  const secret = process.env.PURGE_SECRET;
  if (!secret) {
    console.log("PURGE_SECRET not set. Purge manually:");
    console.log(
      `  curl -X POST ${site}/api/internal/purge -H "Authorization: Bearer \$PURGE_SECRET" -H "Content-Type: application/json" -d '{"tags":["top","area","guide","place"],"prefixes":["shards/"]}'`,
    );
  } else {
    const res = await fetch(`${site}/api/internal/purge`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      // shard が変わればページの中身も変わるので、ページのタグも一緒に purge する
      body: JSON.stringify({ tags: ["top", "area", "guide", "place"], prefixes: ["shards/"] }),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`purge failed: HTTP ${res.status} ${text.slice(0, 200)}`);
    } else {
      console.log("purge:", res.status, text);
    }
  }
}
process.exit(0);
