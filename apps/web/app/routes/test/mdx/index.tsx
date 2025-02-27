import { Place } from './Place'

export const mdxComponents = {
  SpotHighlight,
  Place,
}

// SpotHighlight.jsx の例
export function SpotHighlight({ id }: { id: string }) {
  // データフェッチはuseLoaderDataを使用するか、propsから受け取る
  return (
    <div className="my-6 rounded-lg border p-4 shadow-md">
      <h3 className="text-xl font-bold">{id} スポット</h3>
      {/* スポット詳細の表示 */}
    </div>
  )
}
