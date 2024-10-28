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
      <h3 className="text-xl font-semibold leading-none tracking-tight">
        {area.i18n[lang.id]}
      </h3>
      <p className="text-sm text-muted-foreground">
        {area.description[lang.id]}
      </p>

      <div className="grid grid-cols-2 gap-2">
        {categories.map((category) => (
          <Link to={`${category.id}`} key={category.id}>
            <Card className="hover:bg-secondary">
              <CardHeader>
                <CardTitle>{category.i18n[lang.id]}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </Stack>
  )
}
