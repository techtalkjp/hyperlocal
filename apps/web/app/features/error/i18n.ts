import type { LanguageId } from '@hyperlocal/consts'
import type { ErrorType } from './utils'

interface ErrorMessages {
  title: string
  description: string
  action: string
}

type ErrorMessageMap = Record<ErrorType, ErrorMessages>

const errorMessagesEn: ErrorMessageMap = {
  'network-error': {
    title: 'Connection Error',
    description:
      'Unable to connect to the server. Please check your internet connection and try again.',
    action: 'Retry',
  },
  'server-error': {
    title: 'Server Error',
    description:
      'A temporary server error has occurred. Please wait a moment and try again.',
    action: 'Retry',
  },
  'not-found': {
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist.',
    action: 'Go to Home',
  },
  unknown: {
    title: 'An Error Occurred',
    description: 'An unexpected error has occurred. Please try again.',
    action: 'Retry',
  },
}

const errorMessagesJa: ErrorMessageMap = {
  'network-error': {
    title: '接続エラー',
    description:
      'サーバーに接続できません。インターネット接続を確認して、もう一度お試しください。',
    action: '再試行',
  },
  'server-error': {
    title: 'サーバーエラー',
    description:
      'サーバーで一時的なエラーが発生しました。しばらく待ってから再度お試しください。',
    action: '再試行',
  },
  'not-found': {
    title: 'ページが見つかりません',
    description: 'お探しのページは存在しません。',
    action: 'ホームへ',
  },
  unknown: {
    title: 'エラーが発生しました',
    description: '予期しないエラーが発生しました。もう一度お試しください。',
    action: '再試行',
  },
}

const errorMessagesKo: ErrorMessageMap = {
  'network-error': {
    title: '연결 오류',
    description:
      '서버에 연결할 수 없습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.',
    action: '재시도',
  },
  'server-error': {
    title: '서버 오류',
    description:
      '일시적인 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    action: '재시도',
  },
  'not-found': {
    title: '페이지를 찾을 수 없습니다',
    description: '찾으시는 페이지가 존재하지 않습니다.',
    action: '홈으로',
  },
  unknown: {
    title: '오류가 발생했습니다',
    description: '예상치 못한 오류가 발생했습니다. 다시 시도해 주세요.',
    action: '재시도',
  },
}

const errorMessagesZhCn: ErrorMessageMap = {
  'network-error': {
    title: '连接错误',
    description: '无法连接到服务器。请检查您的互联网连接并重试。',
    action: '重试',
  },
  'server-error': {
    title: '服务器错误',
    description: '发生了临时服务器错误。请稍候再试。',
    action: '重试',
  },
  'not-found': {
    title: '未找到页面',
    description: '您查找的页面不存在。',
    action: '返回首页',
  },
  unknown: {
    title: '发生错误',
    description: '发生了意外错误。请重试。',
    action: '重试',
  },
}

const errorMessagesZhTw: ErrorMessageMap = {
  'network-error': {
    title: '連線錯誤',
    description: '無法連線到伺服器。請檢查您的網路連線並重試。',
    action: '重試',
  },
  'server-error': {
    title: '伺服器錯誤',
    description: '發生了臨時伺服器錯誤。請稍候再試。',
    action: '重試',
  },
  'not-found': {
    title: '找不到頁面',
    description: '您查找的頁面不存在。',
    action: '返回首頁',
  },
  unknown: {
    title: '發生錯誤',
    description: '發生了意外錯誤。請重試。',
    action: '重試',
  },
}

const errorMessagesByLanguage: Record<LanguageId, ErrorMessageMap> = {
  en: errorMessagesEn,
  ja: errorMessagesJa,
  ko: errorMessagesKo,
  'zh-cn': errorMessagesZhCn,
  'zh-tw': errorMessagesZhTw,
}

/**
 * エラータイプと言語IDから適切なエラーメッセージを取得する
 */
export const getErrorMessages = (
  errorType: ErrorType,
  languageId: LanguageId = 'en',
): ErrorMessages => {
  const messages = errorMessagesByLanguage[languageId]
  return messages?.[errorType] ?? errorMessagesEn[errorType]
}
