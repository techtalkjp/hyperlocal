import type { ActionFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { jsonWithSuccess } from 'remix-toast'
import categories from '~/assets/categories.json'
import { Button } from '~/components/ui'
import { getCityAreaCategory } from '~/features/admin/city-area-category/get-city-area-category'
import { requireAdminUser } from '~/services/auth.server'
import { registerAreaGooglePlacesCategoryTask } from '~/trigger/register-area-google-places-category'

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await requireAdminUser(request)
  const { city, area } = getCityAreaCategory(params)
  if (!city) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }
  if (!area) {
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  }

  const handle = await registerAreaGooglePlacesCategoryTask.batchTrigger(
    categories.map((category) => ({
      payload: {
        cityId: area.cityId,
        areaId: area.areaId,
        radius: area.radius,
        categoryId: category.id,
      },
    })),
  )

  return jsonWithSuccess(
    { handle },
    {
      message: 'Task triggered',
      description: `Triggered ${categories.length} tasks: ${city.name} - ${area.areaId}, ${categories.length} categories, ${area.radius}m`,
    },
  )
}

export default function AdminCityAreaIndexPage() {
  const fetcher = useFetcher<typeof action>()
  return (
    <fetcher.Form method="POST">
      <Button type="submit" isLoading={fetcher.state === 'submitting'}>
        Register
      </Button>
    </fetcher.Form>
  )
}
