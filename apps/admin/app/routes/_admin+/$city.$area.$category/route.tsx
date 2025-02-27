import { Link, Outlet, replace } from 'react-router'
import { Stack, Tabs, TabsList, TabsTrigger } from '~/components/ui'
import { getPathParams } from '~/features/admin/get-path-params'
import { requireAdminUser } from '~/services/auth.server'
import type { Route } from './+types/route'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  await requireAdminUser(request)
  const { rankType } = getPathParams(params)
  if (!rankType) {
    throw replace('rating')
  }
}

export default function AdminCreategoryIndex() {
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
