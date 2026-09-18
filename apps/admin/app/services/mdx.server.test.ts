import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import { compileMDX } from "./mdx.server";

const dir = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(dir, "testdata/article.mdx"), "utf8");
const oldCompiled = readFileSync(join(dir, "testdata/article.compiled.old.txt"), "utf8");

// Mirrors the mdx-bundler/client getMDXExport calling convention, which is
// also what the public site uses to render stored compiledCode:
// new Function(React, ReactDOM, _jsx_runtime, ...globals)(code).
function runCompiled(
  code: string,
  globals: Record<string, unknown> = {},
): { default: (props: { components?: object }) => React.ReactElement } {
  const scope = { React, _jsx_runtime: jsxRuntime, ...globals };
  // 本番と同じくコンパイル済みMDXを実行するための new Function。テスト対象の仕様。
  // eslint-disable-next-line no-implied-eval
  const fn = new Function(...Object.keys(scope), code);
  return fn(...Object.values(scope));
}

const PlaceStub = ({ id }: { id: string }) => React.createElement("span", { "data-place": id });

function renderHtml(code: string): string {
  const Component = runCompiled(code).default;
  return renderToStaticMarkup(React.createElement(Component, { components: { Place: PlaceStub } }));
}

describe("compileMDX contract", () => {
  it("emits code for the getMDXExport calling convention (no arguments[0])", async () => {
    const code = await compileMDX("# Hello\n\nSome *text*.\n");
    expect(code).not.toContain("arguments[0]");
    expect(code).toContain("} = _jsx_runtime;");
    expect(renderHtml(code)).toContain("Hello");
  });

  it("renders the real fixture identically to the stored esbuild output", async () => {
    const expected = renderHtml(oldCompiled);
    expect(expected).toContain("data-place");
    const actual = renderHtml(await compileMDX(source));
    expect(actual).toBe(expected);
  });
});
