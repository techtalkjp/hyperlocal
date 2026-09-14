import { compile } from '@mdx-js/mdx'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

// The exact destructure line @mdx-js/mdx emits first in function-body output.
// Rewritten below so the code runs under the mdx-bundler/client
// getMDXExport calling convention (new Function(React, ReactDOM,
// _jsx_runtime, code)). If an upgrade changes this shape, the replacement
// misses and we throw instead of shipping silently broken articles.
const JSX_RUNTIME_DESTRUCTURE =
  'const {Fragment: _Fragment, jsx: _jsx, jsxs: _jsxs} = arguments[0];'
const JSX_RUNTIME_REPLACEMENT =
  'const {Fragment: _Fragment, jsx: _jsx, jsxs: _jsxs} = _jsx_runtime;'

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
    outputFormat: 'function-body',
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeHighlight],
  })
  const code = String(result)
  if (!code.includes(JSX_RUNTIME_DESTRUCTURE)) {
    throw new Error(
      'compileMDX: unexpected @mdx-js/mdx output shape, refusing to emit',
    )
  }
  return code.replace(JSX_RUNTIME_DESTRUCTURE, JSX_RUNTIME_REPLACEMENT)
}
