// app/routes/area.$id.jsx

import { getMDXComponent } from 'mdx-bundler/client'
import { useMemo } from 'react'
import { useLoaderData } from 'react-router'
import { mdxComponents } from '~/components/mdx'
import { compileMDX } from '~/services/mdx.server'

// ローダー関数（サーバーサイド）
export async function loader() {
  // MDXのコンパイル
  const mdxResult = await compileMDX(`
# 渋谷エリア

渋谷は東京を代表する商業・エンターテイメント地区で、世界的に有名なスクランブル交差点と活気あふれるナイトライフで知られています。

## 主要スポット

<SpotHighlight id="shibuya-crossing" />

スクランブル交差点では最大3,000人が一度に交差することもあります。特に夕方から夜にかけての光景は圧巻です。

<SpotHighlight id="hachiko-statue" />

## グルメ情報


## 交通アクセス

`)
  if (!mdxResult) {
    throw new Error('MDXのコンパイルに失敗しました')
  }

  return {
    code: mdxResult.code,
    frontmatter: mdxResult.frontmatter,
  }
}

// クライアントサイドのコンポーネント
export default function AreaRoute() {
  const { title, code, frontmatter } = useLoaderData()

  // MDXコンポーネントの作成（クライアントサイド）
  const MDXContent = useMemo(() => {
    if (!code) return null
    return getMDXComponent(code)
  }, [code])

  if (!MDXContent) {
    return <div>コンテンツの読み込みに失敗しました</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{title}</h1>
      <div className="prose prose-lg max-w-none">
        <MDXContent components={mdxComponents} />
      </div>
    </div>
  )
}
