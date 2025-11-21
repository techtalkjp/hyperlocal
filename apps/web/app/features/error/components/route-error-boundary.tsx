import type { LanguageId } from '@hyperlocal/consts'
import { isRouteErrorResponse, useRouteError } from 'react-router'
import { classifyError } from '../utils'
import { ErrorDisplay } from './error-display'

interface RouteErrorBoundaryProps {
  languageId?: LanguageId
}

/**
 * ルートレベルで使用するエラーバウンダリーコンポーネント
 *
 * 各ルートファイルで以下のようにエクスポートして使用する:
 * ```tsx
 * export const ErrorBoundary = () => <RouteErrorBoundary languageId={lang.id} />
 * ```
 */
export const RouteErrorBoundary = ({
  languageId = 'en',
}: RouteErrorBoundaryProps) => {
  const error = useRouteError()

  // エラーの種類を分類
  const errorType = classifyError(error)

  // 開発環境ではエラーの詳細をコンソールに出力
  if (process.env.NODE_ENV === 'development') {
    console.error('Route error:', error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <ErrorDisplay errorType={errorType} languageId={languageId} />

      {/* 開発環境ではエラーの詳細情報を表示 */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 max-w-2xl p-4">
          <summary className="cursor-pointer text-sm text-gray-500">
            Error Details (Development Only)
          </summary>
          <pre className="mt-2 overflow-auto rounded bg-gray-100 p-4 text-xs">
            {isRouteErrorResponse(error)
              ? JSON.stringify(error, null, 2)
              : error instanceof Error
                ? `${error.name}: ${error.message}\n\n${error.stack}`
                : JSON.stringify(error, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
