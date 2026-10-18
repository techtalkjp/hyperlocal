import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { createAuth } from "../app/lib/auth.ts";

test("invalidates a signed admin session through the real sign-out endpoint", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "hyperlocal-logout-test-"));
  const database = new DatabaseSync(path.join(dir, "auth.db"));
  try {
    database.exec(`
      CREATE TABLE user (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL,
        email_verified INTEGER NOT NULL, image TEXT, role TEXT, created_at TEXT, updated_at TEXT);
      CREATE TABLE session (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, token TEXT NOT NULL,
        expires_at TEXT NOT NULL, ip_address TEXT, user_agent TEXT, created_at TEXT, updated_at TEXT);
      CREATE TABLE account (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, account_id TEXT NOT NULL,
        provider_id TEXT NOT NULL, access_token TEXT, refresh_token TEXT,
        access_token_expires_at TEXT, refresh_token_expires_at TEXT, scope TEXT, id_token TEXT,
        password TEXT, created_at TEXT, updated_at TEXT);
      CREATE TABLE verification (id TEXT PRIMARY KEY, identifier TEXT NOT NULL, value TEXT NOT NULL,
        expires_at TEXT NOT NULL, created_at TEXT, updated_at TEXT);
    `);
    const now = new Date().toISOString();
    const expires = new Date(Date.now() + 86_400_000).toISOString();
    database
      .prepare("INSERT INTO user VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run("u1", "Admin", "admin@example.test", 1, null, "admin", now, now);
    const token = "synthetic-admin-session";
    database
      .prepare("INSERT INTO session VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run("s1", "u1", token, expires, null, null, now, now);
    const secret = "synthetic-secret-for-isolated-session-test";
    const signature = createHmac("sha256", secret).update(token).digest("base64");
    const cookie = `__Secure-better-auth.session_token=${token}.${signature}`;
    const auth = createAuth({
      DATABASE_URL: `file:${path.join(dir, "auth.db")}`,
      BETTER_AUTH_URL: "https://admin.hyper-local.app",
      BETTER_AUTH_SECRET: secret,
      ADMIN_EMAILS: "admin@example.test",
    });
    const headers = new Headers({ cookie });
    assert.equal((await auth.api.getSession({ headers }))?.user.role, "admin");

    const response = await auth.handler(
      new Request("https://admin.hyper-local.app/api/auth/sign-out", {
        method: "POST",
        headers: {
          cookie,
          origin: "https://admin.hyper-local.app",
          "content-type": "application/json",
        },
        body: "{}",
      }),
    );
    assert.equal(response.status, 200);
    assert.match(response.headers.get("set-cookie") ?? "", /Secure/);
    assert.equal(await auth.api.getSession({ headers }), null);
    assert.equal(database.prepare("SELECT count(*) AS n FROM session").get()?.n, 0);
  } finally {
    database.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
