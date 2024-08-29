import { Link, useLocation } from '@remix-run/react'
import { GlobeIcon } from 'lucide-react'
import type React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  HStack,
} from '~/components/ui'
import languages, { type LanguageId } from '~/consts/languages'
import { cn } from '~/libs/utils'

function generateLanguageUrls(
  currentPathname: string,
  currentLanguage: LanguageId,
) {
  // 現在の言語のパスを取得
  const currentLangPath =
    languages.find((lang) => lang.id === currentLanguage)?.path || ''

  // 現在のパスから言語部分を削除
  let pathWithoutLang = currentPathname
  if (currentLangPath) {
    pathWithoutLang = currentPathname.replace(
      new RegExp(`^/${currentLangPath}`),
      '',
    )
  }
  // パスが'/'で始まっていない場合、追加する
  if (!pathWithoutLang.startsWith('/')) {
    pathWithoutLang = `/${pathWithoutLang}`
  }

  return languages.map((lang) => ({
    id: lang.id,
    url: lang.id === 'en' ? pathWithoutLang : `/${lang.path}${pathWithoutLang}`,
    displayName: lang.displayName,
  }))
}

interface LanguageSelectProps
  extends React.ComponentProps<typeof DropdownMenuTrigger> {
  currentLanguageId: LanguageId
}
export const LanguageSelect = ({
  currentLanguageId,
  className,
  ...rest
}: LanguageSelectProps) => {
  const currentLang = languages.find((lang) => lang.id === currentLanguageId)
  const location = useLocation()
  const languageUrls = generateLanguageUrls(
    location.pathname,
    currentLanguageId,
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'rounded border px-2 py-0.5 text-sm text-muted-foreground',
          className,
        )}
        {...rest}
      >
        <HStack>
          <GlobeIcon size="12" className="inline" />
          {currentLang?.displayName}
        </HStack>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{currentLang?.displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languageUrls
          .filter((l) => l.id !== currentLang?.id)
          .map((lang) => (
            <DropdownMenuItem key={lang.id} asChild>
              <Link to={lang.url} prefetch="intent">
                {lang.displayName}
              </Link>
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
