import { categories } from '@hyperlocal/consts'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Card, CardHeader, CardTitle, Stack } from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { lang, area } = await getPathParams(request, params)
  if (!area) {
    throw new Response('Not Found', { status: 404 })
  }
  return { lang, area }
}

export default function AreaIndexPage() {
  const { lang, area } = useLoaderData<typeof loader>()
  return (
    <Stack>
      <div className="mx-auto my-8 gap-8">
        <h3
          className="text-center text-xl font-semibold leading-none tracking-tight"
          style={{ viewTransitionName: `area-title-${area.areaId}` }}
        >
          {area.i18n[lang.id]}
        </h3>

        <p
          className="mt-8 max-w-96 text-sm text-muted-foreground"
          style={{ viewTransitionName: `area-description-${area.areaId}` }}
        >
          {area.description[lang.id]}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {categories.map((category) => (
          <Link to={`${category.id}`} key={category.id} viewTransition>
            <Card className="hover:bg-secondary">
              <CardHeader>
                <CardTitle
                  style={{ viewTransitionName: `nav-category-${category.id}` }}
                >
                  {category.i18n[lang.id]}
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </Stack>
  )
}
