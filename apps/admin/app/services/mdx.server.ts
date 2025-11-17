import { bundleMDX } from 'mdx-bundler'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

/**
 * Compile MDX source to executable code
 *
 * @param source - MDX source string
 * @returns Compiled code string ready for execution
 */
export async function compileMDX(source: string): Promise<string> {
  const result = await bundleMDX({
    source,
    mdxOptions(options) {
      options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkGfm]
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        rehypeHighlight,
      ]
      return options
    },
  })
  return result.code
}
