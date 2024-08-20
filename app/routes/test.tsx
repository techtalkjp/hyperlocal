import type { ActionFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
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
import { helloWorldTask } from '~/trigger/example'

export const action = async ({ request }: ActionFunctionArgs) => {
  const name = ((await request.formData()).get('name') as string) ?? 'no name'
  const handle = await helloWorldTask.trigger({ name })
  return { handle }
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
