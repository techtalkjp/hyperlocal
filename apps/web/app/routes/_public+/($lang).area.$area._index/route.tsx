import { categories } from '@hyperlocal/consts'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Card, CardHeader, CardTitle } from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { lang } = await getPathParams(request, params)
  return { lang }
}

export default function AreaIndexPage() {
  const { lang } = useLoaderData<typeof loader>()
  return (
    <div className="grid grid-cols-2 gap-2">
      {categories.map((category) => (
        <Link to={`${category.id}`} key={category.id} prefetch="intent">
          <Card className="hover:bg-secondary">
            <CardHeader>
              <CardTitle>{category.i18n[lang.id]}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  )
}
