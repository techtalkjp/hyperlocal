import { areas as allAreas, cities } from '@hyperlocal/consts'
import { Link } from 'react-router'
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  HStack,
  Stack,
} from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'
import { getCityDomain } from '~/features/city-area/utils/get-city-domain'
import { generateAlternateLinks } from '~/features/seo/alternate-links'
import { generateCanonicalLink } from '~/features/seo/canonical-url'
import type { Route } from './+types/route'

export const headers: Route.HeadersFunction = () => ({
  // cache for 30 days
  'Cache-Control':
    'public, max-age=14400, s-maxage=2592000, stale-while-revalidate=2592000',
})

const metaDescriptions: Record<string, string> = {
  en: 'Discover top-rated restaurants and places across Tokyo. Explore 20 areas with real-time status, ratings, and instant guides for cafes, dining, and local spots.',
  ja: '東京の厳選レストランとスポットを発見。20エリアのカフェ、グルメ、ローカルスポットをリアルタイムの営業状況と評価でチェック。',
  'zh-cn':
    '探索东京的顶级餐厅和场所。覆盖20个地区，提供咖啡馆、餐饮和本地景点的实时状态和评分。',
  'zh-tw':
    '探索東京的頂級餐廳和場所。覆蓋20個地區，提供咖啡廳、餐飲和本地景點的即時狀態和評分。',
  ko: '도쿄의 최고 평점 레스토랑과 장소를 발견하세요. 20개 지역의 카페, 맛집, 로컬 명소를 실시간 영업 정보와 평점으로 확인하세요.',
}

export const meta: Route.MetaFunction = ({ data, location }) => {
  if (!data || !data.url) return []
  return [
    {
      title: `Hyperlocal ${data?.city.i18n[data.lang.id]}`,
    },
    {
      name: 'description',
      content: metaDescriptions[data.lang.id] || metaDescriptions.en,
    },
    generateCanonicalLink(location.pathname),
    ...generateAlternateLinks({
      url: data.url,
    }),
  ]
}

export const loader = ({ request, params }: Route.LoaderArgs) => {
  const { city, lang } = getPathParams(request, params)
  const areas = allAreas.filter((area) => area.cityId === city.cityId)

  return { url: request.url, cities, city, areas, lang }
}

export default function IndexPage({
  loaderData: { areas, city, lang, url },
}: Route.ComponentProps) {
  return (
    <Stack>
      <HStack className="mx-auto my-8 gap-8">
        {cities.map((c) => (
          <Button
            key={c.cityId}
            variant={c.cityId === city.cityId ? 'default' : 'outline'}
            className="min-w-20"
            asChild
          >
            <a href={getCityDomain(url, c.cityId).href}>{c.i18n[lang.id]}</a>
          </Button>
        ))}
      </HStack>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {areas.map((area) => (
          <Link
            key={area.areaId}
            to={`area/${area.areaId}`}
            prefetch="viewport"
            viewTransition
          >
            <Card className="hover:bg-secondary h-full">
              <CardHeader className="h-full">
                <CardTitle
                  style={{ viewTransitionName: `area-title-${area.areaId}` }}
                >
                  {area.i18n[lang.id]}
                </CardTitle>
                <CardDescription
                  style={{
                    viewTransitionName: `area-description-${area.areaId}`,
                  }}
                >
                  {area.description[lang.id]}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </Stack>
  )
}
