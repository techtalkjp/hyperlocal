import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./save-article.ts", import.meta.url));
const root = fileURLToPath(new URL("../../../", import.meta.url));
const tsx = path.join(root, "apps/web/node_modules/.bin/tsx");
const article = JSON.stringify({
  title: "Test article",
  description: "Test description",
  content: "Test content",
});

test("rejects a path separator before writing a file", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "hyperlocal-article-test-"));
  try {
    const result = spawnSync(tsx, [script, "--stdin", "--area", "../escape", "--scene", "morning"], {
      cwd: dir,
      input: article,
      encoding: "utf8",
    });
    assert.notEqual(result.status, 0);
    assert.equal(existsSync(path.join(dir, "content")), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("saves a valid article within content/articles", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "hyperlocal-article-test-"));
  try {
    const result = spawnSync(
      tsx,
      [script, "--stdin", "--area", "asakusa", "--scene", "morning-cafe"],
      { cwd: dir, input: article, encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    const saved = path.join(dir, "content/articles/asakusa-morning-cafe.json");
    assert.equal(JSON.parse(readFileSync(saved, "utf8")).title, "Test article");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
