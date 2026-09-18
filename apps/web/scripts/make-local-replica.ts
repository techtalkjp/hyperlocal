import { createClient } from "@libsql/client";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "~/services/env.server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../../..");
const replicaDbPath = path.join(projectRoot, "data/production-replica.db");

const config = {
  url: `file:${replicaDbPath}`,
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncUrl: process.env.TURSO_DATABASE_URL,
};

// NOTE: 既存レプリカは消さないこと。消すと全量(約178MB)の再DLになり
// Turso無料枠のsync quota(月3GB)を十数回で枯渇させアカウント停止に至る。
// 残したまま client.sync() すれば差分フレームのみの増分syncになる。
console.log("📥 Syncing production data from Turso (incremental)...");
console.log(`   Source: ${config.syncUrl}`);
console.log(`   Target: ${replicaDbPath}\n`);

const client = createClient(config);
const ret = await client.sync();

console.log("✅ Production data downloaded successfully!");
console.log(`   Frames synced: ${ret?.frames_synced ?? "unknown"}`);
console.log(`   Saved to: ${replicaDbPath}\n`);
console.log("💡 To use this data for development:");
console.log("   pnpm db:reset    # Copy production-replica.db → dev.db");
