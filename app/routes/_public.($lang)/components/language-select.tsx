import { Link, useLocation, useNavigate } from '@remix-run/react'
import { GlobeIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  HStack,
} from '~/components/ui'
import languages, { type LanguageId } from '~/consts/languages'

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

export const LanguageSelect = ({
  currentLanguageId,
}: {
  currentLanguageId: LanguageId
}) => {
  const currentLang = languages.find((lang) => lang.id === currentLanguageId)
  const navigate = useNavigate()
  const location = useLocation()
  const languageUrls = generateLanguageUrls(
    location.pathname,
    currentLanguageId,
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <HStack>
          <GlobeIcon size="16" className="inline" />
          {currentLang?.displayName}
        </HStack>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="text-foreground/70">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        {languageUrls.map((lang) => (
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
