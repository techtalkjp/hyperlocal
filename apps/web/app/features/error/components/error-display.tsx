import type { LanguageId } from '@hyperlocal/consts'
import {
  AlertCircle,
  Home,
  RefreshCw,
  ServerCrash,
  WifiOff,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useRevalidator } from 'react-router'
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui'
import { getErrorMessages } from '../i18n'
import type { ErrorType } from '../utils'

interface ErrorDisplayProps {
  errorType: ErrorType
  languageId?: LanguageId
}

export const ErrorDisplay = ({
  errorType,
  languageId = 'en',
}: ErrorDisplayProps) => {
  const revalidator = useRevalidator()
  const [isRetrying, setIsRetrying] = useState(false)
  const messages = getErrorMessages(errorType, languageId)

  const handleRetry = () => {
    setIsRetrying(true)
    revalidator.revalidate()

    // 3秒後に再試行ボタンを再度有効化
    setTimeout(() => {
      setIsRetrying(false)
    }, 3000)
  }

  // エラータイプに応じたアイコンとバッジ色を決定
  const getErrorConfig = () => {
    switch (errorType) {
      case 'network-error':
        return {
          icon: WifiOff,
          badgeVariant: 'default' as const,
          badgeText: 'Network Error',
        }
      case 'server-error':
        return {
          icon: ServerCrash,
          badgeVariant: 'destructive' as const,
          badgeText: 'Server Error',
        }
      case 'not-found':
        return {
          icon: AlertCircle,
          badgeVariant: 'secondary' as const,
          badgeText: 'Not Found',
        }
      default:
        return {
          icon: AlertCircle,
          badgeVariant: 'destructive' as const,
          badgeText: 'Error',
        }
    }
  }

  const { icon: Icon, badgeVariant, badgeText } = getErrorConfig()

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Icon className="h-8 w-8 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle>{messages.title}</CardTitle>
                <Badge variant={badgeVariant}>{badgeText}</Badge>
              </div>
              <CardDescription>{messages.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex gap-2">
        {errorType === 'not-found' ? (
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              {messages.action}
            </Link>
          </Button>
        ) : (
          <Button onClick={handleRetry} disabled={isRetrying}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`}
            />
            {messages.action}
          </Button>
        )}
      </div>
    </div>
  )
}
