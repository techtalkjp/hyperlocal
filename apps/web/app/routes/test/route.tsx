import { getMDXComponent } from 'mdx-bundler/client'
import { useMemo } from 'react'
import { mdxComponents } from '~/routes/test/mdx'
import { compileMDX } from '~/services/mdx.server'
import type { Route } from './+types/route'
import { listPlaces } from './queries.server'

// ローダー関数（サーバーサイド）
export async function loader() {
  const places = await listPlaces()
  // MDXのコンパイル
  const mdxResult = await compileMDX(`
# 渋谷エリア

渋谷は東京を代表する商業・エンターテイメント地区で、世界的に有名なスクランブル交差点と活気あふれるナイトライフで知られています。

## 主要スポット

<Place id="0" />

<SpotHighlight id="shibuya-crossing" />

<Place id="1" />

<Place id="2" />

<Place id="3" />

<Place id="4" />



スクランブル交差点では最大3,000人が一度に交差することもあります。特に夕方から夜にかけての光景は圧巻です。

<SpotHighlight id="hachiko-statue" />

## グルメ情報


## 交通アクセス

`)
  if (!mdxResult) {
    throw new Error('MDXのコンパイルに失敗しました')
  }

  return {
    places,
    title: mdxResult.frontmatter.title,
    code: mdxResult.code,
    frontmatter: mdxResult.frontmatter,
  }
}

// クライアントサイドのコンポーネント
export default function AreaRoute({
  loaderData: { title, code },
}: Route.ComponentProps) {
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
