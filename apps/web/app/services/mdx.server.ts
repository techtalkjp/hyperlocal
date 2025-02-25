import { bundleMDX } from 'mdx-bundler'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

export async function compileMDX(source: string) {
  if (!source) return null

  // MDXのバンドル/コンパイル処理
  try {
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

    return result
  } catch (error) {
    console.error('MDX compilation error:', error)
    throw error
  }
}
