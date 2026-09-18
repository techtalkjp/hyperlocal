import { compile } from "@mdx-js/mdx";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

// The first line @mdx-js/mdx emits in function-body output destructures the
// jsx runtime from `arguments[0]` (the exact members vary with content).
// Rewritten below so the code runs under the mdx-bundler/client
// getMDXExport calling convention (new Function(React, ReactDOM,
// _jsx_runtime, code)). If an upgrade changes this shape, the replacement
// misses and we throw instead of shipping silently broken articles.
const JSX_RUNTIME_DESTRUCTURE = /const \{[^}]*\} = arguments\[0\];/;

/**
 * Compile MDX source to executable code.
 *
 * Pure JS (no esbuild), so this runs on Cloudflare Workers as well as Node.
 * Output follows the same convention as the previous mdx-bundler build and
 * is rendered with getMDXComponent on the public site.
 *
 * @param source - MDX source string
 * @returns Compiled code string ready for execution
 */
export async function compileMDX(source: string): Promise<string> {
  const result = await compile(source, {
    outputFormat: "function-body",
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeHighlight],
  });
  const code = String(result);
  if (!JSX_RUNTIME_DESTRUCTURE.test(code)) {
    throw new Error("compileMDX: unexpected @mdx-js/mdx output shape, refusing to emit");
  }
  return code.replace(JSX_RUNTIME_DESTRUCTURE, (match) =>
    match.replace("arguments[0]", "_jsx_runtime"),
  );
}
