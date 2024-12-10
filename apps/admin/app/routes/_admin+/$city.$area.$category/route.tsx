import type { LoaderFunctionArgs } from 'react-router'
import { Link, Outlet, replace, useLoaderData } from 'react-router'
import { Stack, Tabs, TabsList, TabsTrigger } from '~/components/ui'
import { getPathParams } from '~/features/admin/get-path-params'
import { requireAdminUser } from '~/services/auth.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAdminUser(request)
  const { city, area, category, rankType } = getPathParams(params)
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!category) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!rankType) {
    throw replace('rating')
  }

  return {
    city,
    area,
    category,
  }
}

export default function AdminCreategoryIndex() {
  const { city, area, category } = useLoaderData<typeof loader>()

  return (
    <Stack>
      <Tabs defaultValue="rating">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="rating" asChild>
            <Link to="rating">Rating</Link>
          </TabsTrigger>
          <TabsTrigger value="review" asChild>
            <Link to="review">Review</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Outlet />
    </Stack>
  )
}
