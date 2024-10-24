import { languages, type LanguageId } from '@hyperlocal/consts'
import { Link, useLocation, useSearchParams } from '@remix-run/react'
import { GlobeIcon } from 'lucide-react'
import type React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  HStack,
} from '~/components/ui'
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
  const [searchParams] = useSearchParams()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'rounded-full border px-2 py-0.5 text-sm text-muted-foreground',
          className,
        )}
        {...rest}
      >
        <HStack>
          <GlobeIcon size="12" className="inline" />
          Language
        </HStack>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="font-semibold">
          {currentLang?.displayName}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {languageUrls
          .filter((l) => l.id !== currentLang?.id)
          .map((lang) => (
            <DropdownMenuItem key={lang.id} asChild>
              <Link
                to={`${lang.url}?${searchParams.toString()}`}
                prefetch="intent"
              >
                {lang.displayName}
              </Link>
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
