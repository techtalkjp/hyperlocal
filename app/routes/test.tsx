import type { ActionFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { jsonWithSuccess } from 'remix-toast'
import { z } from 'zod'
import { zx } from 'zodix'
import categories from '~/assets/categories.json'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Stack,
} from '~/components/ui'
import { registerAreaGooglePlacesCategoryTask } from '~/trigger/register-area-google-places-category'

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { areaId } = zx.parseParams(params, { areaId: z.string() })
  const radius = z.number().parse((await request.formData()).get('radius'))

  const handle = await registerAreaGooglePlacesCategoryTask.batchTrigger(
    categories.map((category) => ({
      payload: {
        areaId,
        radius,
        categoryId: category.id,
      },
    })),
  )

  return jsonWithSuccess(
    { handle },
    {
      message: 'Task triggered',
      description: `Triggered ${categories.length} tasks: ${areaId}, ${radius}m`,
    },
  )
}

export default function TestPage() {
  const fetcher = useFetcher<typeof action>()

  return (
    <fetcher.Form method="POST">
      <Card>
        <CardHeader>
          <CardTitle>Trigger a task</CardTitle>
        </CardHeader>
        <CardContent>
          <Stack>
            <Label htmlFor="name">Name</Label>
            <Input name="name" id="name" type="text" />
            <Button isLoading={fetcher.state === 'submitting'} type="submit">
              submit
            </Button>
          </Stack>
          <div>{JSON.stringify(fetcher.data?.handle)}</div>
        </CardContent>
      </Card>
    </fetcher.Form>
  )
}
