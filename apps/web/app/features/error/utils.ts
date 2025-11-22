export type ErrorType =
  | 'network-error'
  | 'server-error'
  | 'not-found'
  | 'unknown'

/**
 * エラーオブジェクトからエラーの種類を分類する
 */
export const classifyError = (error: unknown): ErrorType => {
  // Response オブジェクトの場合
  if (error instanceof Response) {
    if (error.status === 404) {
      return 'not-found'
    }
    if (error.status >= 500) {
      return 'server-error'
    }
  }

  // Error オブジェクトの場合
  if (error instanceof Error) {
    if (isNetworkError(error)) {
      return 'network-error'
    }
  }

  return 'unknown'
}

/**
 * ネットワークエラーかどうかを判定する
 */
export const isNetworkError = (error: Error): boolean => {
  // TypeError でメッセージに fetch または network が含まれる場合
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase()
    return message.includes('fetch') || message.includes('network')
  }
  return false
}
